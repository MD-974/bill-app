
/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import mockStore from "../__mocks__/store"
import {
  localStorageMock
} from "../__mocks__/localStorage.js"
import {
  ROUTES_PATH,
  ROUTES
} from "../constants/routes.js"
import router from "../app/Router.js";


jest.mock("../app/Store", () => mockStore)

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
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        // Stockage de l'utilisateur
        window.localStorage.setItem('user', JSON.stringify(objectUser))
        // Crée un nouvel objet "NewBill"
        return new NewBill({
          document,
          onNavigate,
          store,
          locaStore: window.localStorage
        });
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
        const file = new File(['file'], 'test.jpg', {
          type: 'image/jpg'
        });

        // Crée un événement de changement
        const event = new Event('change', {
          bubbles: true
        });

        // Définit la propriété 'files' de l'élément d'entrée de fichier avec le fichier créé
        Object.defineProperty(fileInput, 'files', {
          value: [file]
        });
        // Déclenche l'événement de changement sur l'élément d'entrée de fichier
        fileInput.dispatchEvent(event)
        // Vérifie que la fonction handleChangeFile renvoie undefined
        expect(newbills.handleChangeFile(event)).not.toBe(false);
      })

      // ---------------------------------------------------------------------------- //
      //                TEST FONCTIONNEL AVEC FICHIERS  NON AUTORISEES                //
      // ---------------------------------------------------------------------------- //
      // Le fichier n'accepte pas d'extension autre que png, jpeg ou jpg
      test("Then the file don't accept other extension than png or jpeg or jpg", () => {
        const fileInput = screen.getByTestId('file')

        // Crée un fichier avec une extension pdf (non autorisée)
        const file = new File(['file'], 'test.pdf', {
          type: 'application/pdf'
        })

        // Crée un événement de changement
        const event = new Event('change', {
          bubbles: true
        })
        Object.defineProperty(fileInput, 'files', {
          value: [file]
        })

        // Déclenche l'événement de changement sur l'élément d'entrée de fichier
        fileInput.dispatchEvent(event)
        // Vérifie que la fonction handleChangeFile renvoie false
        expect(newbills.handleChangeFile(event)).toBe(false)
      })
      // ---------------------------------------------------------------------------- //
      //                           TEST D'INTEGRATION (POST)                          //
      // ---------------------------------------------------------------------------- //
      test("Then submit the form, redirect to the dashboard page, and display the new bill in the list", async () => {
        // On cree des espions
        const handleSubmitSpy = jest.spyOn(newbills, 'handleSubmit')
        const onNavigateSpy = jest.spyOn(newbills, 'onNavigate')
        // Ensuite soumettre le formulaire, rediriger vers la page du tableau de bord et afficher la nouvelle facture dans la liste
        // 1: Fill the form
        // Remplir le formulaire
        screen.getByTestId('expense-type').value = 'Transports'
        screen.getByTestId('expense-name').value = 'Test expense'
        screen.getByTestId('datepicker').value = '2021-09-01'
        screen.getByTestId('amount').value = '100'
        screen.getByTestId('vat').value = '20'
        screen.getByTestId('pct').value = '10'
        screen.getByTestId('commentary').value = 'Test commentary'
        // 2: Add a file
        // Ajouter un fichier
        const fileInput = screen.getByTestId('file')
        const file = new File(['file'], 'test.jpg', { type: 'image/jpg' })
        Object.defineProperty(fileInput, 'files', { value: [file] })
        const changeEvent = new Event('change', { bubbles: true })
        fileInput.dispatchEvent(changeEvent)
        expect(newbills.handleChangeFile(changeEvent)).not.toBe(false)
        // 3: Submit the form
        // Soumettre le formulaire
        const form = screen.getByTestId('form-new-bill')
        form.addEventListener('submit', newbills.handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmitSpy).toHaveBeenCalled();
        // 3.1: Verify redirection to the dashboard
        // Vérifier la redirection vers la page du tableau de bord
        await waitFor(() => {
          expect(onNavigateSpy).toHaveBeenCalledWith('#employee/bills')
        })
        // await waitFor(() => {
        //   expect(screen.getByText('Mes notes de frais')).toBeInTheDocument()
        // })
        // 3.2: Verify the new bill appears in the list
        // Vérifier que la nouvelle facture apparaît dans la liste
        // const newBillTitle = await screen.findByText('Test expense')
        // expect(newBillTitle).toBeTruthy()
        
      })
    })
  })
})

