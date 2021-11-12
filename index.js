import ace from 'ace-builds'
import ResizeObserver from 'resize-observer-polyfill'
const Events = [
  'blur',
  'input',
  'change',
  'changeSelectionStyle',
  'changeSession',
  'copy',
  'focus',
  'paste'
]

function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default {
  props: {
    value: {},
    lang: {
      type: String,
      default: 'text'
    },
    theme: {
      type: String,
      default: 'textmate'
    },
    options: Object,
    placeholder: String,
    readonly: Boolean,
    wrap: Boolean,
    printMargin: {
      type: [Boolean, Number],
      default: true
    },
    minLines: Number,
    maxLines: Number,
    useWorker: {
      type: Boolean,
      default: true
    },
    lazy: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'init', ...Events],
  data () {
    return {
      ro: null,
      editor: null,
      contentBackup: ''
    }
  },
  watch: {
    value (val) {
      if (val && this.contentBackup !== val) {
        this.setValue(val)
        this.contentBackup = val
      }
    },
    theme (val) {
      this.editor.setTheme('ace/theme/' + val)
    },
    options (val) {
      this.editor.setOptions(val)
    },
    readonly (val) {
      this.editor.setReadOnly(val)
    },
    placeholder (val) {
      this.editor.setOption('placeholder', val)
    },
    wrap (val) {
      this.editor.setWrapBehavioursEnabled(val)
    },
    printMargin (val) {
      this.editor.setOption('printMargin', val)
    },
    lang (val) {
      this.editor.setOption('mode', 'ace/mode/' + val)
    },
    minLines (val) {
      this.editor.setOption('minLines', val)
    },
    maxLines (val) {
      this.editor.setOption('maxLines', val)
    }
  },
  created () {
    if (!this.lazy) {
      require('ace-builds/src-noconflict/ext-language_tools')
      ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@' + require('ace-builds').version + '/src-noconflict/')
    }
  },
  mounted () {
    const editor = this.editor = ace.edit(this.$el, {
      placeholder: this.placeholder,
      readOnly: this.readonly,
      value: this.value,
      mode: 'ace/mode/' + this.lang,
      theme: 'ace/theme/' + this.theme,
      wrap: this.wrap,
      printMargin: this.printMargin,
      useWorker: this.useWorker,
      minLines: this.minLines,
      maxLines: this.maxLines,
      enableBasicAutoCompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      ...this.options
    })
    this.contentBackup = this.value
    editor.on('change', () => {
      const content = editor.getValue()
      this.contentBackup = content
      this.$emit('input', content)
    })
    Events.forEach(x => {
      const eventName = 'on' + capitalize(x)
      if (this['_events'][eventName]) {
        editor.on(x, this.$emit.bind(this, eventName))
      }
    })
    this.ro = new ResizeObserver(() => editor.resize())
    this.ro.observe(this.$el)
    this.$emit('init', editor)
  },
  beforeDestroy () {
    this.editor.destroy()
    this.editor.container.remove()
  },
  methods: {
    focus () {
      this.editor.focus()
    },
    blur () {
      this.editor.blur()
    },
    selectAll() {
      this.editor.selectAll()
    },
    setValue(val,cursorPos = 1) {
      this.editor.setValue(val,cursorPos)
    },
    getValue() {
      return this.editor.getValue()
    },
    redo(){
      this.editor.redo()
    },
    undo() {
      this.editor.undo()
    },
    toUpperCase() {
      this.editor.toUpperCase()
    },
    toLowerCase() {
      this.editor.toLowerCase()
    },
    setTheme(theme) {
      this.editor.setTheme(theme)
    },
    getTheme(){
      return this.editor.getTheme()
    },
    setReadOnly(readOnly) {
      this.editor.setReadOnly(readOnly)
    },
    getReadOnly() {
      return this.editor.getReadOnly()
    },
    setFontSize(size){
      this.editor.setFontSize(size)
    },
    insert(text){
      this.editor.insert(text)
    },
    gotoPageUp(){
      this.editor.gotoPageUp()
    },
    gotoPageDown(){
      this.editor.gotoPageDown()
    },
    destroy(){
      this.editor.destroy()
    }
  },
  render (h) {
    return h('div')
  }
}
