import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

/**
 * Un objet qui mappe les abréviations des mois en numéros de mois.
 * @type {Object}
 */
const monthMap = {
  'Jan.': '01',
  'Fév.': '02',
  'Mar.': '03',
  'Avr.': '04',
  'Mai.': '05',
  'Juin': '06',
  'Jui.': '07',
  'Aoû.': '08',
  'Sep.': '09',
  'Oct.': '10',
  'Nov.': '11',
  'Déc.': '12',
};

/**
 * Convertit une chaîne de caractères représentant une date en objet Date.
 * @param {string} dateString - La chaîne de caractères représentant la date.
 * @return {Date} L'objet Date correspondant à la chaîne de caractères fournie.
 */
const convertDate = dateString => {
  let dateArray = dateString.split(' ')
  if (dateArray.length === 3) {
    dateString = `20${dateArray[2]}-${monthMap[dateArray[1]]}-${dateArray[0]}`
  }
  dateArray = dateString.split('-')
  return new Date(`${dateArray[0]}-${dateArray[1]}-${dateArray[2]}`)
}

/**
 * Renvoie un élément de ligne de tableau HTML pour un objet de facture donné.
 * @param {Object} bill - L'objet facture contenant les propriétés suivantes
 * @return {string} L'élément de ligne de tableau HTML pour l'objet facture donné.
 */
const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

/**
 * Génère une chaîne de lignes de tableau HTML à partir d'un tableau d'objets de facture, trié par date dans l'ordre croissant.
 * @param {Array<Object>} data - Un tableau d'objets de facture.
 * @return {string} Une chaîne de lignes de tableau HTML représentant les factures, triées par date.
 * Si les données d'entrée sont vides ou fausses, un tableau vide est retourné.
 */
const rows = (data) => {
  return data && data.length 
    ? data
    // .sort((a,b) => (new Date(a.date) > new Date(b.date) ? 1 : -1))
    // changement de new Date en convertDate ainsi que le sens du chevron
      .sort((a,b) => (convertDate(a.date) < convertDate(b.date) ? 1 : -1))
      .map(bill => row(bill))
      .join("")
    : []
}

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}