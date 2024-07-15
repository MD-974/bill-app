/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {screen, fireEvent, waitFor} from "@testing-library/dom"
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES_PATH} from "../constants/routes.js";


jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
  // "Étant donné que je suis connecté en tant qu'employé"
  describe("When I am on Bills Page", () => {
  // "Quand je suis sur la page des factures"

  // ---------------------------------------------------------------------------- //
  //                               TEST ACTIVE ICON                               //
  // ---------------------------------------------------------------------------- //
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // "Alors l'icône de la facture dans la disposition verticale devrait être mise en surbrillance"
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Définit un utilisateur de type 'Employee' dans le localStorage
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Appelle la fonction "router() pour initialiser le routeur"
      router()
      // Navigue vers la route des factures
      window.onNavigate(ROUTES_PATH.Bills)
      // Attend que l'élément avec le data-testid 'icon-window' soit rendu dans le DOM
      await waitFor(() => screen.getByTestId('icon-window'))
      // Recupère l'element avec le data-testid 'icon-window'
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      // Vérifie que la classe "active-icon" est ajoutée à l'élément 'windowIcon' 
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
    })

  // ---------------------------------------------------------------------------- //
  //                               TEST DATE SORT                                 //
  // ---------------------------------------------------------------------------- //
    test("Then bills should be ordered from earliest to latest", () => {
      // "Alors les factures devraient être ordonnées de la plus ancienne à la plus récente"
      
      // Ajoute le contenu HTML des factures à la page
      document.body.innerHTML = BillsUI({ data: bills })

      // Extraction des dates des factures affichées à l'aide d'une expression régulière
      // Récupère tous les éléments de texte correspondant au format de date (yyyy-mm-dd) et extrait leur contenu HTML
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      // Définition d'une fonction de tri pour les dates, de la plus récente à la plus ancienne
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      
      // Tri des dates extraites en utilisant la fonction de tri définie (antiChrono)
      const datesSorted = [...dates].sort(antiChrono)
      
      // Verification de l'ordre des dates par rapport "datesSorted"
      expect(dates).toEqual(datesSorted)
    })

  // ---------------------------------------------------------------------------- //
  //                               TEST NEW BILLS                                 //
  // ---------------------------------------------------------------------------- //
    describe ("When I click on 'nouvelle note de frais'", () => {
      // Lorsque je clique sur la 'nouvelle note de frais'
      test("Then I am directed to the NewBill page", () => {
        // Alors je suis diréger vers la page NewBill

        // Définit la propriété 'localStorage' de la fenêtre avec une simulation de localStorage
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        // Stocke un utilisateur de type 'Employee' dans le localStorage
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        // Crée un élément div avec l'id 'root' et l'ajoute au corps du document
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)

        // Initialise le routeur
        router()
        // Navigue vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills)
        // Simule un clic sur le bouton 'nouvelle note de frais'
        fireEvent.click(screen.getByTestId('btn-new-bill'))
        // Vérifie que le formulaire 'form-new-bill' est présent dans le document
        expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      })
    })

    // ---------------------------------------------------------------------------- //
    //                             TEST MODAL BILLS                                 //
    // ---------------------------------------------------------------------------- //
    describe ("When I click on icon 'eye'", () => {
    // Lorsque je clique sur l'icone 'eye'
      test("Then I can open a modal by clicking on the eye icon", () => { 
      // Alors je peux ouvrir une modale en cliquant sur l'icone 'eye' 

      // Mock de la fonction modale de jQuery
      $.fn.modal = jest.fn()

      // Création et ajout de l'élément 'root' au corps du document
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Initialisation du routeur
      router()
      // Navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills)

      // Ajoutez une donnée de facture dans le tableau des factures pour le test.
      const testDataBill = bills[0];
      document.body.innerHTML = BillsUI({ data: [testDataBill] })

      // Creation d'un objet Bills pour gérer l'affichage des factures.
      const billsObject = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      //Récupérez l'icône "icon-eye"
      const iconEye = screen.getByTestId('icon-eye')
      // Fonction de rappel pour ouvrir la modale
      const openModale = jest.fn(billsObject.handleClickIconEye(iconEye))
      //Ajout d'un écouteur d'événement pour le clic sur "icon-eye"
      iconEye.addEventListener('click', openModale)
      //Simulez le clic sur l'icône "icon-eye".
      fireEvent.click(iconEye)
      //Verification si la modale est ouverte
      expect(openModale).toHaveBeenCalled()
      })
    })

    // ---------------------------------------------------------------------------- //
    //                            TEST D'INTEGRATION                                   //
    // ---------------------------------------------------------------------------- //
    describe("Given I am connected as an employee", () => {
      // Lorsque je suis connecté en tant qu'employé

      beforeAll(() => {
        // Configuration d’un pseudo localStorage et d’un utilisateur employé avec un e-mail
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))
      })
    
      describe("When I get redirected to the Bills Page", () => {
        // Lorsque je suis redirigé vers la page 'Bills'
        test("Then it fetches bills from mock API GET", async () => {
          // Alors j'obtiens les factures de l'API mocké

          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.append(root)
          router()
          window.onNavigate(ROUTES_PATH.Bills)

          //verification de l'existence du titre "Mes notes de frais"
          await waitFor(() => screen.getByText("Mes notes de frais"))
          expect(screen.getByText("Mes notes de frais")).toBeTruthy()
        })
    
        describe("When an error occurs on API", () => {
          // Lorsque j'obtiens une erreur lors du passage d'une requête vers l'API
          beforeEach(() => {
            // Espionne la méthode "bills" du mockStore
            jest.spyOn(mockStore, "bills")
    
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
          })
    
          test("Then it try to fetch bills from an API and fails with 404 message error", async () => {
              // Alors j'obtiens une erreur 404 lors du passage d'une requête vers l'API
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 404"))
                }
              }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)
            const message = screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
          })
  // --------------------------- DOUBLON DU TEST 404 POUR LE 500 ------------------------- //
  //                               DOUBLON DU TEST 404                                //
  // -------------------------------------------------------------------------------- //
          // test("fetches messages from an API and fails with 500 message error", async () => {
          //     // Alors j'obtiens une erreur 500 lors du passage d'une requête vers l'API
          //   mockStore.bills.mockImplementationOnce(() => {
          //     return {
          //       list: () => {
          //         return Promise.reject(new Error("Erreur 500"))
          //       }
          //     }
          //   })
          //   window.onNavigate(ROUTES_PATH.Bills)
          //   await new Promise(process.nextTick)
          //   const message = screen.getByText(/Erreur 500/)
          //   expect(message).toBeTruthy()
          // })
// -------------------------------------------------------------------------------- //
        })
      })
    })
  })
})



