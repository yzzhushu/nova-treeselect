import IndexField from './components/IndexField'
import DetailField from './components/DetailField'
import FormField from './components/FormField'

Nova.booting((app, store) => {
  app.component('index-tree-select', IndexField)
  app.component('detail-tree-select', DetailField)
  app.component('form-tree-select', FormField)
})
