import Component from "./Component.js"

export default class LangTable extends Component {
    elTxtSearch = this.selectElement('#txtSearch')
    elDataRows = this.selectElements('tbody tr')

    constructor(options) {
        super(options)

        this.elTxtSearch.addEventListener('input', (e) => this.onNameSearch(e))
    }

    onNameSearch() {
        const reText = new RegExp(this.elTxtSearch.value.trim(),'i')

        this.elDataRows.forEach(elRow => {
            const langName = elRow.cells[1].textContent.trim()
            elRow.hidden = !reText.test(langName)
        })
    }
}