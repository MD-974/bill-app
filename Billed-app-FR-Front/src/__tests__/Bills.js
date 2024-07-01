/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import Bills from "../containers/Bills.js";
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  // "Étant donné que je suis connecté en tant qu'employé"
  describe("When I am on Bills Page", () => {
  // "Quand je suis sur la page des factures"


  // ---------------------------------------------------------------------------- //
  //                                TEST POUR ICON                                //
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
  //                               TEST TRI DES DATES                             //
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
  })
})
