import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  // code de base fourni

  // handleChangeFile = e => {
  //   e.preventDefault()
  //   const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
  //   const filePath = e.target.value.split(/\\/g)
  //   const fileName = filePath[filePath.length-1]
  //   const formData = new FormData()
  //   const email = JSON.parse(localStorage.getItem("user")).email
  //   formData.append('file', file)
  //   formData.append('email', email)




  // --------------------------------------------------------------------- //
  //                           code modifié                                //
  // --------------------------------------------------------------------- //
  handleChangeFile = e => {
    e.preventDefault()
    const input = this.document.querySelector(`input[data-testid="file"]`)
    const file = input.files[0]

    // Ajout des extensions autorisées .png, .jpeg ou .jpg
    // Tableau des types MIME de fichiers autorisés
    const fileTypes = ['image/jpeg', 'image/jpg', 'image/png']

    // Sélection de l'élément du message d'alerte
    const fileAlert = document.getElementById('fileAlert')

    // Vérifie si le type de fichier sélectionné n'est pas inclus dans les types autorisés
    if (!fileTypes.includes(file.type)) {
      // Si le type de fichier n'est pas autorisé, vide la valeur du champ de saisie
      input.value = ""
      // Affiche le message d'erreur en rouge
      fileAlert.textContent = "Format de fichier non supporté. Veuillez télécharger un fichier .jpg, .jpeg ou .png."
      fileAlert.style.display = 'block'
      // Renvoie false pour indiquer un échec dans le traitement
      return false
      } else {
      // Masquer l'alerte si le format est correct
      fileAlert.style.display = 'none'
    }
  // --------------------------------------------------------------------- //
  //                           fin code modifié                            //
  // --------------------------------------------------------------------- //




    // Si le format est correct, affiche le nom du fichier
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const formData = new FormData() 
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}