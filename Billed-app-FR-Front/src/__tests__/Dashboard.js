/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import DashboardFormUI from "../views/DashboardFormUI.js"
import DashboardUI from "../views/DashboardUI.js"
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import router from "../app/Router"

jest.mock("../app/Store", () => mockStore)
// Mocke le module '../app/Store' en utilisant 'mockStore' comme implémentation simulée.

describe('Given I am connected as an Admin', () => {
  // Étant donné que je suis connecté en tant qu'administrateur

  describe('When I am on Dashboard page, there are bills, and there is one pending', () => {
    test('Then, filteredBills by pending status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "pending")
      expect(filtered_bills.length).toBe(1)
    })
  })

  describe('When I am on Dashboard page, there are bills, and there is one accepted', () => {
    test('Then, filteredBills by accepted status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "accepted")
      expect(filtered_bills.length).toBe(1)
    })
  })

  describe('When I am on Dashboard page, there are bills, and there is two refused', () => {
    test('Then, filteredBills by accepted status should return 2 bills', () => {
      const filtered_bills = filteredBills(bills, "refused")
      expect(filtered_bills.length).toBe(2)
    })
  })

  describe('When I am on Dashboard page but it is loading', () => {
    // Lorsque je suis sur la page du tableau de bord mais qu'elle est en cours de chargement
    test('Then, Loading page should be rendered', () => {
      // Alors, la page de chargement devrait être rendue

      // Définit le contenu HTML de la page du tableau de bord avec l'indicateur de chargement
      document.body.innerHTML = DashboardUI({ loading: true })
      // Vérifie que le texte 'Loading...' est présent à l'écran
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page but back-end send an error message', () => {
    // Lorsque je suis sur la page du tableau de bord mais que le back-end renvoie un message d'erreur
    test('Then, Error page should be rendered', () => {
      // Alors, la page d'erreur devrait être rendue

      // Définit le contenu HTML de la page du tableau de bord avec un message d'erreur simulé
      document.body.innerHTML = DashboardUI({ error: 'some error message' })
      // Vérifie que le texte 'Erreur' est présent à l'écran
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click on arrow', () => {
    // Lorsque je suis sur la page du tableau de bord et que je clique sur une flèche
    test('Then, tickets list should be unfolding, and cards should appear', async () => {
      // Alors, la liste des tickets devrait se déplier et les cartes devraient apparaître

      // Fonction de navigation qui change le contenu de la page en fonction du chemin spécifié
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Définit une propriété "localStorage" sur l'objet window avec une valeur simulée
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Ajoute un utilisateur de type "Admin" dans le localStorage pour simuler une connexion en tant qu'administrateur
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      // Crée un nouvel objet Dashboard avec les paramètres nécessaires
      const dashboard = new Dashboard({
        document, onNavigate, store: null, bills: bills, localStorage: window.localStorage
      })

      // Définit le contenu HTML de la page du tableau de bord avec les données des factures
      document.body.innerHTML = DashboardUI({ data: { bills } })

      // Fonctions simulées pour afficher les tickets pour chaque icône de flèche
      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
      const handleShowTickets2 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 2))
      const handleShowTickets3 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 3))

      // Récupère les icônes de flèche correspondantes
      const icon1 = screen.getByTestId('arrow-icon1')
      const icon2 = screen.getByTestId('arrow-icon2')
      const icon3 = screen.getByTestId('arrow-icon3')

      // Ajoute des écouteurs d'événements pour chaque icône de flèche
      icon1.addEventListener('click', handleShowTickets1)
      // Simule un clic sur la première icône de flèche
      userEvent.click(icon1)
      // Vérifie que la fonction handleShowTickets a été appelée
      expect(handleShowTickets1).toHaveBeenCalled()
      // Attend que la carte correspondant au premier ticket se charge
      await waitFor(() => screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`))
      // Vérifie que la carte du premier ticket est présente
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()

      // Ajoute un écouteur d'événement pour la deuxième icône de flèche
      icon2.addEventListener('click', handleShowTickets2)
      userEvent.click(icon2)
      expect(handleShowTickets2).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`))
      expect(screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)).toBeTruthy()

      // Ajoute un écouteur d'événement pour la troisième icône de flèche
      icon3.addEventListener('click', handleShowTickets3)
      userEvent.click(icon3)
      expect(handleShowTickets3).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`))
      expect(screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click on edit icon of a card', () => {
    // Lorsque je suis sur la page du tableau de bord et que je clique sur l'icône d'édition d'une carte
    test('Then, right form should be filled', () => {
      // Alors, le bon formulaire devrait être rempli

      // Fonction de navigation qui change le contenu de la page en fonction du chemin spécifié
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Définit une propriété "localStorage" sur l'objet window avec une valeur simulée
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      // Crée un nouvel objet Dashboard avec les paramètres nécessaires
      const dashboard = new Dashboard({
        document, onNavigate, store: null, bills: bills, localStorage: window.localStorage
      })

      // Définit le contenu HTML de la page du tableau de bord avec les données des factures
      document.body.innerHTML = DashboardUI({ data: { bills } })
      // Fonction simulée pour afficher les tickets
      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
      // Récupère l'icône de flèche (arrow-icon1) et y ajoute un écouteur d'événement pour afficher les tickets
      const icon1 = screen.getByTestId('arrow-icon1')
      icon1.addEventListener('click', handleShowTickets1)

      // Simule un clic sur l'icône de flèche
      userEvent.click(icon1)
      // Vérifie que la fonction handleShowTickets a été appelée
      expect(handleShowTickets1).toHaveBeenCalled()
      // Vérifie que l'icône d'édition est présente
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
      // Récupère l'icône d'édition et simule un clic
      const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      userEvent.click(iconEdit)
      // Vérifie que le formulaire de tableau de bord est présent
      expect(screen.getByTestId(`dashboard-form`)).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click 2 times on edit icon of a card', () => {
    // Lorsque je suis sur la page du tableau de bord et que je clique 2 fois sur l'icône d'édition d'une carte
    test('Then, big bill Icon should Appear', () => {
      // Alors, "big bill Icon" devrait apparaître

      // Fonction de navigation qui change le contenu de la page en fonction du chemin spécifié
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Définit une propriété "localStorage" sur l'objet window avec une valeur simulée
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      // Création d'un objet Dashboard avec les paramètres nécessaires
      const dashboard = new Dashboard({
        document, onNavigate, store: null, bills: bills, localStorage: window.localStorage
      })
      // Définit le contenu HTML de la page du tableau de bord avec les données des factures
      document.body.innerHTML = DashboardUI({ data: { bills } })

      // Fonction simulée pour afficher les tickets
      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
      // Récupère l'icône de flèche (arrow-icon1) et y ajoute un écouteur d'événement pour afficher les tickets
      const icon1 = screen.getByTestId('arrow-icon1')
      icon1.addEventListener('click', handleShowTickets1)
      // Simule un clic sur l'icône de flèche
      userEvent.click(icon1)
      // Vérifie que la fonction handleShowTickets a été appelée
      expect(handleShowTickets1).toHaveBeenCalled()
      // Vérifie que l'icône d'édition est présente
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
      // Récupère l'icône d'édition et simule deux clics
      const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      userEvent.click(iconEdit)
      userEvent.click(iconEdit)
      // Vérifie que "big-billed-icon" est présente
      const bigBilledIcon = screen.queryByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })

  describe('When I am on Dashboard and there are no bills', () => {
    // Lorsque je suis sur le tableau de bord et qu'il n'y a pas de factures
    test('Then, no cards should be shown', () => {
      // Alors, aucune carte ne devrait être affichée

      // Injecte le HTML des cartes (vide) dans le corps du document
      document.body.innerHTML = cards([])
      // Tente de récupérer l'élément avec le data-testid 'open-bill47qAXb6fIm2zOKkLzMro'
      const iconEdit = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      // Vérifie que l'élément est nul (c'est-à-dire qu'il n'existe pas dans le DOM)
      expect(iconEdit).toBeNull()
    })
  })
})

describe('Given I am connected as Admin, and I am on Dashboard page, and I clicked on a pending bill', () => {
  // Étant donné que je suis connecté en tant qu'admin, que je suis sur la page du tableau de bord et que j'ai cliqué sur une facture en attente

  // ----------------------------------------------------------------------------------------------- //
  //                                        BUTTON ACCEPT BILLS                                      //
  // ----------------------------------------------------------------------------------------------- //
  describe('When I click on accept button', () => {
    // Lorsque je clique sur le bouton d'acceptation
    test('I should be sent on Dashboard with big billed icon instead of form', () => {
      // Je devrais être redirigé vers le tableau de bord avec l'icône de grande facture au lieu du formulaire

      // Simule le localStorage pour l'utilisateur Admin
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      // Injecte le HTML du formulaire de facture dans le corps du document
      document.body.innerHTML = DashboardFormUI(bills[0])

      // Fonction de navigation pour changer le contenu du document en fonction du chemin
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Initialisation de l'objet Dashboard avec les paramètres nécessaires
      const store = null
      const dashboard = new Dashboard({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      // Récupère le bouton d'acceptation de facture
      const acceptButton = screen.getByTestId("btn-accept-bill-d")
      // Crée une fonction espion pour handleAcceptSubmit
      const handleAcceptSubmit = jest.fn((e) => dashboard.handleAcceptSubmit(e, bills[0]))
      // Ajoute un écouteur d'événement de clic au bouton d'acceptation
      acceptButton.addEventListener("click", handleAcceptSubmit)
      // Simule un clic sur le bouton d'acceptation
      fireEvent.click(acceptButton)

      // Vérifie que handleAcceptSubmit a été appelé
      expect(handleAcceptSubmit).toHaveBeenCalled()

      // Vérifie que "big-billed-icon" est présente dans le DOM
      const bigBilledIcon = screen.queryByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })

  // ----------------------------------------------------------------------------------------------- //
  //                                        BUTTON REFUSE BILLS                                      //
  // ----------------------------------------------------------------------------------------------- //
  describe('When I click on refuse button', () => {
    // Lorsque je clique sur le bouton de refus
    test('I should be sent on Dashboard with big billed icon instead of form', () => {
      // Je devrais être redirigé vers le tableau de bord avec "big-billed-icon" au lieu du formulaire

      // Simule le localStorage pour l'utilisateur Admin
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      // Injecte le HTML du formulaire de facture dans le corps du document
      document.body.innerHTML = DashboardFormUI(bills[0])

      // Fonction de navigation pour changer le contenu du document en fonction du chemin
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Initialisation de l'objet Dashboard avec les paramètres nécessaires
      const store = null
      const dashboard = new Dashboard({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      // Récupère le bouton de refus de facture
      const refuseButton = screen.getByTestId("btn-refuse-bill-d")
      // Crée une fonction espionne pour handleRefuseSubmit
      const handleRefuseSubmit = jest.fn((e) => dashboard.handleRefuseSubmit(e, bills[0]))
      // Ajoute un écouteur d'événement de clic au bouton de refus
      refuseButton.addEventListener("click", handleRefuseSubmit)
      // Simule un clic sur le bouton de refus
      fireEvent.click(refuseButton)
      // Vérifie que handleRefuseSubmit a été appelé
      expect(handleRefuseSubmit).toHaveBeenCalled()

      // Vérifie que "big-billed-icon" est présente dans le DOM
      const bigBilledIcon = screen.queryByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })
})

// ----------------------------------------------------------------------------------------------- //
//                                            OPEN MODAL                                           //
// ----------------------------------------------------------------------------------------------- //
describe('Given I am connected as Admin and I am on Dashboard page and I clicked on a bill', () => {
  // Étant donné que je suis connecté en tant qu'administrateur, que je suis sur la page du tableau de bord et que j'ai cliqué sur une facture
  describe('When I click on the icon eye', () => {
    // Lorsque je clique sur l'icône oeil

    test('A modal should open', () => {
      // Une modal devrait s'ouvrir

      // Simule le localStorage pour l'utilisateur Admin
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      // Injecte le HTML du formulaire de facture dans le corps du document
      document.body.innerHTML = DashboardFormUI(bills[0])

      // Fonction de navigation pour changer le contenu du document en fonction du chemin
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Initialisation de l'objet Dashboard avec les paramètres nécessaires
      const store = null
      const dashboard = new Dashboard({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      // Crée une fonction espion pour surveiller les appels à handleClickIconEye
      const handleClickIconEye = jest.fn(dashboard.handleClickIconEye)
      // Ajoute un écouteur d'événement de clic à l'icône oeil
      const eye = screen.getByTestId('icon-eye-d')
      eye.addEventListener('click', handleClickIconEye)

      // Simule un clic sur l'icône oeil
      userEvent.click(eye)
      // Vérifie que handleClickIconEye a été appelé
      expect(handleClickIconEye).toHaveBeenCalled()

      // Vérifie que la modale est présente dans le DOM
      const modale = screen.getByTestId('modaleFileAdmin')
      expect(modale).toBeTruthy()
    })
  })
})


// *********************************************************************************************** //
// **                                  TEST D'INTEGRATION GET                                   ** //
// *********************************************************************************************** //
describe("Given I am a user connected as Admin", () => {
  // Étant donné que je suis un utilisateur connecté en tant qu’administrateur
  describe("When I navigate to Dashboard", () => {
    // Lorsque je navigue vers le tableau de bord

    // ----------------------------------------------------------------------------------------------- //
    //                                              FACTURES                                           //
    // ----------------------------------------------------------------------------------------------- //
    test("fetches bills from mock API GET", async () => {
      // récupère les factures à partir de l’API simulée

      // Définir un utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
      // Création d'un élément div avec l'id 'root'
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Initialisation du routeur
      router()
      // Navigation vers la page du tableau de bord
      window.onNavigate(ROUTES_PATH.Dashboard)

      // ----------------------------------------------------------------------------------------------- //
      //                        RECUPERATION/VERIFICATION  "ATTENTE,REFUSE,VALIDATION"                   //
      // ----------------------------------------------------------------------------------------------- //
      // Attendre que l'élément "Validations" soit rendu
      await waitFor(() => screen.getByText("Validations"))
      // Récupérer et vérifier que le contenu "En attente (1)" est présent
      const contentPending = await screen.getByText("En attente (1)")
      expect(contentPending).toBeTruthy()
      // Récupérer et vérifier que le contenu "Refusé (2)" est présent
      const contentRefused = await screen.getByText("Refusé (2)")
      expect(contentRefused).toBeTruthy()
      // Vérifier que l'élément avec le data-testid "big-billed-icon" est présent
      expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
    })
    // ----------------------------------------------------------------------------------------------- //

    describe("When an error occurs on API", () => {
      // Lorsqu’une erreur se produit sur l’API

      beforeEach(() => {
        // Utilise jest pour espionner la méthode "bills" de "mockStore"
        jest.spyOn(mockStore, "bills")
        // Définit une propriété sur l'objet window pour simuler le localStorage
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        // Stocke un utilisateur de type 'Admin' avec l'email 'a@a' dans le localStorage
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Admin',
          email: "a@a"
        }))
        // Crée un nouvel élément div et lui attribue l'id 'root'
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        // Ajoute cet élément div au corps du document
        document.body.appendChild(root)
        // Initialise le routeur de l'application
        router()
      })

      // ----------------------------------------------------------------------------------------------- //
      //                                             ERREUR 404                                          //
      // ----------------------------------------------------------------------------------------------- //
      test("fetches bills from an API and fails with 404 message error", async () => {
        // Teste la récupération des factures depuis une API et échoue avec un message d'erreur 404
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              // Simule un rejet de promesse avec une erreur 404 lors de l'appel à la méthode "list"
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        // Navigue vers la page du tableau de bord
        window.onNavigate(ROUTES_PATH.Dashboard)
        // Attend la prochaine itération de la boucle d'événements
        await new Promise(process.nextTick)
        // Recherche un élément contenant le message d'erreur 404 dans le DOM
        const message = await screen.getByText(/Erreur 404/)
        // Vérifie que le message d'erreur 404 est bien présent dans le DOM
        expect(message).toBeTruthy()
      })

      // ----------------------------------------------------------------------------------------------- //
      //                                             ERREUR 500                                          //
      // ----------------------------------------------------------------------------------------------- //
      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  })
})

