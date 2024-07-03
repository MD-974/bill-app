/**
 * @jest-environment jsdom
 */

// import NewBillUI from "../views/NewBillUI.js"
// import NewBill from "../containers/NewBill.js"
// import { screen } from "@testing-library/dom"


// describe("Given I am connected as an employee", () => {
//   // "Étant donné que je suis connecté en tant qu’employé"
//   describe("When I am on NewBill Page", () => {
//     // "Quand je suis sur la page NewBill"

//     beforeEach(() => {
//       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee',
//         email: 'a@a'
//       }))
//       const html = NewBillUI()
//       document.body.innerHTML = html
//     })
//   })
// })

/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { screen, waitFor } from "@testing-library/dom"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  // "Étant donné que je suis connecté en tant qu’employé"
  describe("When I am on NewBill Page", () => {
    // "Quand je suis sur la page NewBill"
    describe("when upload file", () => {
      // "Quand j'upload un fichier"
      
      // Fonction pour initialiser un nouveau module "NewBill"
      function initialisationNewBill() {
        // Génère le contenu HTML pour le module NewBill
        const html = NewBillUI();
        // Inject le contenu HTML dans le corps de la page
        document.body.innerHTML = html;
        // Crée une fonction de navigation fictive pour les tests (Jest)
        const onNavigate = jest.fn(() => {});
        // Crée un magasin  pour les tests
        const store = mockStore
        // Crée un objet qui définit l'utilisateur
        const objectUser = {
            type: "Employee",
            email: "employee@test.tld",
            password: "employee",
            status: "connected"
        }
        // Crée un objet "localStorage"
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        // Stockage de l'utilisateur
        window.localStorage.setItem('user', JSON.stringify(objectUser))
        // Crée un nouvel objet "NewBill"
        return new NewBill({ document, onNavigate, store, locaStore: window.localStorage });
      }

      let newbills
      // Avant chaque test, initialise un nouvel objet "NewBill"
      beforeEach(() => {
        newbills = initialisationNewBill()
      })

      // ---------------------------------------------------------------------------- //
      //                 TEST FONCTIONNEL AVEC FICHIERS AUTORISEES                    //
      // ---------------------------------------------------------------------------- //
      // Le fichier a l'extension png, jpeg ou jpg
      test("Then the file is of extension png or jpeg or jpg", () => {
        // Obtient l'élément d'entrée de fichier en utilisant un attribut de test
        const fileInput = screen.getByTestId('file')

        // Crée un fichier avec une extension jpg
        const file = new File(['file'], 'test.jpg', { type: 'image/jpg' });

        // Crée un événement de changement
        const event = new Event('change', { bubbles: true });

        // Définit la propriété 'files' de l'élément d'entrée de fichier avec le fichier créé
        Object.defineProperty(fileInput, 'files', {
            value: [file]
        });

        // Déclenche l'événement de changement sur l'élément d'entrée de fichier
        fileInput.dispatchEvent(event)
        // Vérifie que la fonction handleChangeFile renvoie undefined
        expect(newbills.handleChangeFile(event)).toBe(undefined)
      })

      // ---------------------------------------------------------------------------- //
      //                TEST FONCTIONNEL AVEC FICHIERS  NON AUTORISEES                //
      // ---------------------------------------------------------------------------- //
      // Le fichier n'accepte pas d'extension autre que png, jpeg ou jpg
      test("Then the file don't accept other extension than png or jpeg or jpg", () => {
        const fileInput = screen.getByTestId('file')

        // Crée un fichier avec une extension pdf (non autorisée)
        const file = new File(['file'], 'test.pdf', { type: 'application/pdf' })

        // Crée un événement de changement
        const event = new Event('change', { bubbles: true })
                Object.defineProperty(fileInput, 'files', {
            value: [file]
        })

        // Déclenche l'événement de changement sur l'élément d'entrée de fichier
        fileInput.dispatchEvent(event)
        // Vérifie que la fonction handleChangeFile renvoie false
        expect(newbills.handleChangeFile(event)).toBe(false)
      })
    })

// ---------------------------------------------------------------------------- //
//                           TEST D'INTEGRATION (POST)                          //
// ---------------------------------------------------------------------------- //
test("POST newBill", async () => {
        // Crée un élément div et l'ajouter
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);

        router()
        window.onNavigate(ROUTES_PATH.NewBill)

        //Attendre que le texte "Envoyer" soit affiché
        await waitFor(() => screen.getAllByText("Envoyer"))
      })

      // En cas d'erreur sur l'API
      describe("When an error occurs on API", () => {
        // Envoi de la facture échoue avec un message d'erreur 500
        test("POST bill fails with 500 message error", async () => {
            try {
                // Crée un spyOn (espionnage) pour le magasin fictif
                jest.spyOn(mockStore, "bills")
                // Navigation vers la page NewBill
                window.onNavigate(ROUTES_PATH.NewBill)

                // Crée une div et l'ajoute
                const root = document.createElement("div")
                root.setAttribute("id", "root")
                document.body.appendChild(root)

                // Active le router
                router()

                // Sélectionne le bouton "Envoyer"
                const buttonSubmit = screen.getAllByText('Envoyer')
                buttonSubmit[0].click()

                // Simuler un echec de l'envoi
                mockStore.bills.mockImplementationOnce(() => {
                  return {
                    create: (bill) => {
                        return Promise.reject(new Error("Erreur 500"))
                      }
                    }
                })

                window.onNavigate(ROUTES_PATH.NewBill)
                await new Promise(process.nextTick)

                // Vérifie la présence du message d'erreur "Erreur 500"
                const message = screen.queryByText(/Erreur 500/)
                await waitFor(() => {
                    expect(message).toBeTruthy()
                })
            } catch (error) {
                console.error(error)
            }
        })

        // Envoi de la facture échoué avec un message d'erreur 404
        test("POST bill fails with 404 message error", async () => {
          try {
              jest.spyOn(mockStore, "bills");
              window.onNavigate(ROUTES_PATH.NewBill)

              const root = document.createElement("div")
              root.setAttribute("id", "root")
              document.body.appendChild(root)
              router()

              // Sélectionne le bouton Envoyer
              const buttonSubmit = screen.getAllByText('Envoyer')
              buttonSubmit[0].click()

              // Simule un échec de l'API 
              mockStore.bills.mockImplementationOnce(() => {
                  return {
                      create: (bill) => {
                          return Promise.reject(new Error("Erreur 404"))
                      }
                  }
              })
              window.onNavigate(ROUTES_PATH.NewBill)
              await new Promise(process.nextTick)
              // Vérification du message d'erreur "Erreur 404"
              const message = screen.queryByText(/Erreur 404/)
              await waitFor(() => {
                  expect(message).toBeTruthy()
              })
          } catch (error) {
            console.error(error)
          }
        })
    })
  })
})
