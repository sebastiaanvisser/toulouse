import { className, px } from '../styling/Css'
import { once } from '../lib/Memo'

export const FontStyles = once(() => {
  const uiFontFamily = "'Ubuntu', 'Open Sans', 'Helvetica', sans-serif"
  const codeFontFamily = "'Ubuntu Mono', 'Courier', monospace"

  const uiFontPadding = '5px 10px'
  const smallFontPadding = '5px 10px'
  const codeFontPadding = '7.5px 10px 7.5px 10px'

  const uiFontS = className('ui-font').style({
    fontFamily: uiFontFamily,
    fontSize: px(13),
    lineHeight: px(20)
  })

  const uiFontSmallS = className('ui-font-small').style({
    fontFamily: uiFontFamily,
    fontSize: px(12),
    lineHeight: px(16)
  })

  const codeFontS = className('code-font').style({
    fontFamily: codeFontFamily,
    fontSize: px(14),
    lineHeight: px(14)
  })

  return {
    uiFontFamily,
    codeFontFamily,
    uiFontPadding,
    smallFontPadding,
    codeFontPadding,
    uiFontS,
    uiFontSmallS,
    codeFontS
  }
})
