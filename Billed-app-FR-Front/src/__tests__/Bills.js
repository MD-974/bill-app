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
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Appelle la fonction "router()"
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      // Vérifie que la classe "active-icon" est ajouté
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
    })

  // ---------------------------------------------------------------------------- //
  //                               TEST DATE SORT                                 //
  // ---------------------------------------------------------------------------- //
    test("Then bills should be ordered from earliest to latest", () => {
      // "Alors les factures devraient être ordonnées de la plus ancienne à la plus récente"
      document.body.innerHTML = BillsUI({ data: bills })

      // Extraction des dates des factures affichées "regex"
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      // Fonction de tri des dates "plus récente à la plus ancienne
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      // Tri des dates 
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
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        fireEvent.click(screen.getByTestId('btn-new-bill'))
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
      $.fn.modal = jest.fn()

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
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
    //test d'intégration GET
    // describe("Given I am connected as an employee", () => {
    //   // Lorsque je suis connecté en tant qu'employé 'Employee'
    //   describe("When I navigate to Dashboard", () => {
    //     // Quand je navigue vers 'Dashboard'
    //     test("fetches bills from mock API GET", async () => {
    //       // Alors j'obtiens les factures de l'API mocké

    //       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
    //       const root = document.createElement("div")
    //       root.setAttribute("id", "root")
    //       document.body.append(root)
    //       router()
    //       window.onNavigate(ROUTES_PATH.Bills)
    //       await waitFor(() => screen.getByText("Nouvelle note de frais"))
    //       const message = screen.getByText("Nouvelle note de frais")
    //       // Verification de la presence du texte "Nouvelle note de frais"
    //       expect(message).toBeTruthy()
    //     })
    //   })
    // })
    describe("Given I am connected as an employee", () => {
      // Lorsque je suis connecté en tant qu'employé
      beforeAll(() => {
        // Setting up mocked localStorage and employee user with an email
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
    
          //make sure Bills Page title appear
          //verification de l'existence du titre "Mes notes de frais"
          await waitFor(() => screen.getByText("Mes notes de frais"))
          expect(screen.getByText("Mes notes de frais")).toBeTruthy()
        })
    
        describe("When an error occurs on API", () => {
          // Lorsque j'obtiens une erreur lors du passage d'une requête vers l'API
          beforeEach(() => {
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



