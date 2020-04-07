import { once, Once } from '../lib/Memo'
import { bz, pt, Point } from '../lib/Geometry'
import * as S from './Shape'
import { layers, mask, Shape } from './Shape'
import { offsetAsIcon, clipAsIcon } from '../widget/Image'

// ----------------------------------------------------------------------------

export const kappa = (4 * (Math.sqrt(2) - 1)) / 3

export const gshape = (w: number, h: number, x: number, y: number) =>
  S.poly(
    pt(w, 0),
    bz(pt(w, x), pt(y, h), pt(0, h)),
    bz(pt(-y, h), pt(-w, x), pt(-w, 0)),
    bz(pt(-w, -x), pt(-y, -h), pt(0, -h)),
    bz(pt(y, -h), pt(w, -x), pt(w, 0))
  )

export const gchevron = once(() => S.line(pt(0, -1), pt(1, 0), pt(0, 1)).rounded())

export const gdlight = once(() => S.line(pt(-1, 0), pt(1, 0)).rounded())

export const gplus = once(() =>
  S.line(pt(0, -1), pt(0, 1))
    .clone(s => s.rotate(90))
    .rounded()
)

export const gstar = once(() => S.starShape(5, 0.47).scale(8).rotate(-90))

export const hstripes = (s = 2, w = 1) =>
  S.array(1 + 40 / s, i => S.line(pt(-20, -20 + i * s), pt(20, -20 + i * s)).width(w))

export const gmarker = once(() =>
  S.poly(
    pt(0, 19),
    bz(pt(7.5, 11.5), pt(11, 5.3), pt(11, 0)),
    bz(pt(11, -6), pt(6, -11), pt(0, -11)),
    bz(pt(-6, -11), pt(-11, -6), pt(-11, 0)),
    bz(pt(-11, 5.3), pt(-7.5, 11.5), pt(0, 19))
  )
)

export const handle = once(() =>
  S.poly(
    pt(10, 0),
    pt(10, 1),
    pt(-10, 1),
    pt(-10, 0),
    bz(pt(-3, 0), pt(-2, -5), pt(0, -5)),
    bz(pt(2, -5), pt(3, 0), pt(10, 0))
  )
)

export const pieSlice = (from: number, to: number, r: number) =>
  S.circleShape(r).clip(
    S.poly(
      pt(0, 0),
      Point.atAngle(from, 2 * r),
      Point.atAngle(to, 2 * r) //
    )
  )

// ----------------------------------------------------------------------------

export const mk = (n: string, s: () => Shape) => once(() => s().named(n))

export const empty = mk('empty', () => layers())

export const square = mk('square', () => S.rect(16, 16))

export const blob = mk('blob', () => gshape(8, 8, 6.5, 6.5))

export const ellipse = mk('ellipse', () => gshape(9, 6, 1, 6))

export const triangle = mk('triangle', () =>
  S.ngon(3)
    .scale(8)
    .width(4 / 8)
    .rounded()
    .rotate(30)
    .dy(1.5)
)

export const circle = mk('circle', () => S.circleShape(8))

export const tick = mk('tick', () =>
  S.line(pt(-0.5, 0), pt(0, 0.5), pt(1, -0.5))
    .rounded()
    .width(2 / 6)
    .scale(6)
    .dx(-1.5)
)

export const caretRight = mk('caretRight', () =>
  S.poly(pt(0, -1), pt(1, 0), pt(0, 1))
    .scale(3)
    .dx(-1.5)
    .width(1.5 / 3)
    .rounded()
)

export const caretDown = mk('caretDown', () => caretRight.get().rotate(90))

export const caretLeft = mk('caretLeft', () => caretRight.get().rotate(180))

export const caretUp = mk('caretUp', () => caretRight.get().rotate(270))

export const chevronRight = mk('chevronRight', () =>
  gchevron.get().dx(-0.5).scale(5).width(0.45)
)

export const chevronDown = mk('chevronDown', () => chevronRight.get().rotate(90))

export const chevronLeft = mk('chevronLeft', () => chevronRight.get().rotate(180))

export const chevronUp = mk('chevronUp', () => chevronRight.get().rotate(270))

export const arrowRight = mk('arrowRight', () =>
  layers(S.line(pt(-1, 0), pt(1, 0)).rounded(), gchevron.get())
    .scale(6)
    .width(0.35)
)

export const arrowDown = mk('arrowDown', () => arrowRight.get().rotate(90))

export const arrowLeft = mk('arrowLeft', () => arrowRight.get().rotate(180))

export const arrowUp = mk('arrowUp', () => arrowRight.get().rotate(270))

export const doubleChevronRight = mk('doubleChevronRight', () =>
  gchevron
    .get()
    .scale(4.5)
    .width(0.4)
    .clones(
      s => s.dx(-2.5),
      x => x.dx(2.5)
    )
    .dx(-1.5)
)

export const doubleChevronDown = mk('doubleChevronDown', () =>
  doubleChevronRight.get().rotate(90)
)

export const doubleChevronLeft = mk('doubleChevronLeft', () =>
  doubleChevronRight.get().rotate(180)
)

export const doubleChevronUp = mk('doubleChevronUp', () =>
  doubleChevronRight.get().rotate(270)
)

export const dot = mk('dot', () => S.circleShape(3))

export const ring = mk('ring', () => S.circleShape(8).outline(2))

export const target = mk('target', () =>
  layers(S.circleShape(6).outline(2), S.circleShape(2.5))
)

export const minus = mk('minus', () => gdlight.get().scale(5).width(0.4))

export const plus = mk('plus', () => gplus.get().scale(5).width(0.4))

export const smallPlus = mk('smallPlus', () => gplus.get().scale(4).width(0.4))

export const cross = mk('cross', () => plus.get().rotate(45))

export const smallCross = mk('smallCross', () =>
  gplus.get().scale(4).width(0.4).rotate(45)
)

export const asterisk = mk('Asterisk', () =>
  gplus
    .get()
    .scale(5)
    .width(0.3)
    .clone(s => s.rotate(45))
)

export const stop = mk('stop', () =>
  mask(
    S.circleShape(8),
    gdlight
      .get()
      .width(1.5 / 4)
      .scale(4)
  )
)

export const add = mk('add', () =>
  mask(
    S.circleShape(8),
    gplus
      .get()
      .width(1.5 / 4)
      .scale(4)
  )
)

export const del = mk('del', () => add.get().rotate(45))

export const alert = mk('alert', () => S.circleShape(8).mask(S.text('!')))

export const help = mk('help', () => S.circleShape(8).mask(S.text('?')))

export const warning = mk('warning', () => triangle.get().mask(S.text('!')))

export const stopOpen = mk('stopOpen', () =>
  layers(
    S.circleShape(8).outline(1.5),
    gdlight
      .get()
      .width(1.5 / 4)
      .scale(4)
  )
)

export const addOpen = mk('addOpen', () =>
  layers(
    S.circleShape(8).outline(1.5),
    gplus
      .get()
      .width(1.5 / 4)
      .scale(4)
  )
)

export const delOpen = mk('delOpen', () => addOpen.get().rotate(45))

export const alertOpen = mk('alertOpen', () =>
  layers(S.circleShape(8).outline(1.5), S.text('!'))
)

export const helpOpen = mk('helpOpen', () =>
  layers(S.circleShape(8).outline(1.5), S.text('?'))
)

export const leftRight = mk('leftRight', () =>
  caretRight
    .get()
    .dx(3.5)
    .clone(s => s.rotate(180))
)

export const upDown = mk('upDown', () => leftRight.get().rotate(90))

export const rightLeft = mk('rightLeft', () =>
  caretLeft
    .get()
    .dx(3.5)
    .clone(s => s.rotate(180))
)

export const downUp = mk('downUp', () => rightLeft.get().rotate(90))

export const splith = mk('splith', () =>
  layers(
    caretRight
      .get()
      .dx(4.5)
      .clone(s => s.rotate(180)),
    S.rect(1, 14, 0.5)
  )
)

export const splitv = mk('splitv', () => splith.get().rotate(90))

export const joinh = mk('joinh', () =>
  layers(
    caretLeft
      .get()
      .dx(4.5)
      .clone(s => s.rotate(180)),
    S.rect(1, 14, 0.5)
  )
)

export const joinv = mk('joinv', () => joinh.get().rotate(90))

export const ellipses = mk('ellipses', () =>
  S.circleShape(1.5).array(3, (s, i) => s.dx(-5 + i * 5))
)

export const hamburger = mk('hamburger', () =>
  S.line(pt(-7, 0), pt(7, 0))
    .rounded()
    .outline(2.5)
    .array(3, (s, i) => s.dy(-5.5 + i * 5.5))
)

export const dots = mk('dots', () => ellipses.get().array(3, (n, i) => n.dy(-5 + i * 5)))

export const camera = mk('camera', () =>
  layers(
    layers(S.rect(15, 11.5, 1.3).dy(0.75), S.rect(5, 12, 1.3).d(-5.5, 1)).mask(
      layers(
        S.circleShape(2.8).outline(1.6).d(0.5, 1.8),
        S.rect(13, 1).dy(-3),
        S.circleShape(0.5)
          .d(-6, -1)
          .array(4, (s, i) => s.dy(i * 2))
      )
    ),
    S.rect(1.5, 1).d(-4.5, -5.5),
    S.rect(3.5, 3, 1).d(4, -5.2)
  ).scale(1.12)
)

export const grid = mk('grid', () =>
  layers(
    S.line(pt(-5, -10), pt(-5, 10)).width(1),
    S.line(pt(0, -10), pt(0, 10)).width(1),
    S.line(pt(5, -10), pt(5, 10)).width(1)
  )
    .clone(s => s.rotate(90))
    .scale(0.8)
)

export const settings6 = mk('settings6', () =>
  S.layers(
    S.layers(
      S.rect(18, 3.5, 1).array(
        3,
        (s, i) => s.rotate(30 + i * 60) //
      ),
      S.circleShape(7.5)
    )
      .mask(S.circleShape(3.5))
      .mask(
        S.circleShape(2.8)
          .dx(9)
          .array(6, (s, i) => s.rotate(i * 60))
      )
  ).rotate(15)
)

export const settings8 = mk('settings8Proc', () =>
  S.layers(
    S.rect(18, 2.5, 1).array(
      4,
      (s, i) => s.rotate(45 / 2 + i * 45) //
    ),
    S.circleShape(7)
  )
    .mask(S.circleShape(3))
    .mask(
      S.circleShape(1.85)
        .dx(8)
        .array(8, (s, i) => s.rotate(i * 45))
    )
    .rotate(-10)
)

export const marker = mk('marker', () => gmarker.get().scale(0.6).dy(-3))

export const mapMarker = mk('MapMarker', () =>
  mask(gmarker.get().scale(0.6), S.circleShape(3)).dy(-3)
)

export const mapMarkerO = mk('mapMarkerO', () =>
  mask(gmarker.get().scale(0.6), S.circleShape(5.5)).dy(-3)
)

export const gglobe = mk('gglobe', () =>
  S.path(
    'M1.41432672,9.92544321 L1.92702203,10.2002423 L1.92702203,11.5186016 L2.63268234,12.5237098 L3.02410549,12.5237098 L3.02410549,11.9518573 L2.63268234,11.1804199 L2.63268234,10.2002423 L3.02410549,11.5186016 L3.66469293,12.3504639 L3.45454419,12.9914739 L3.83272741,13.6722037 L5.38813794,14.1974346 L5.96830058,13.8508019 L5.96830058,14.1974346 L6.94383018,14.6342116 L7.7918902,15.5984732 L9.03320442,15.5984732 L9.03320442,16.5496357 L8.42191386,17.1207839 L8.24556921,18.4442139 L9.37251294,19.9914551 L9.37251294,20.4845722 L9.96549296,20.4845722 L10.8228491,21.5343299 L10.8228491,24.0096342 L11.1841303,24.2195012 L10.8228491,25.4888447 L11.4434358,25.8905499 L11.4434358,27.480187 L13.0409606,29.2367319 L14.0780418,29.2367319 L13.362522,28.1866925 L13.5185842,27.480187 L13.0409606,27.0431284 L13.362522,26.3997239 L12.887152,26.0963323 L14.0780418,25.8905499 L15.5717599,23.7272292 L15.4180921,22.4891545 L15.8096561,22.2225248 L16.6905343,22.2225248 L17.311121,21.7934946 L17.311121,19.9914551 L18.0917137,19.2241023 L18.0917137,18.4442139 L17.5091566,18.4442139 L17.311121,17.7177077 L15.5717599,17.7177077 L14.7275028,17.3400879 L14.5460875,16.31681 L13.362522,15.8646804 L12.4938978,14.8159086 L12.1207852,15.1931058 L11.1841303,15.1931058 L11.0193354,14.6342116 L9.96549296,14.6342116 L9.57505576,15.1931058 L8.04091363,15.1931058 L8.04091363,13.8508019 L7.20722035,13.6722037 L7.49413253,13.220074 L7.20722035,12.5237098 L6.25239576,13.3852915 L5.53391807,13.220074 L5.16066461,12.7090689 L5.53391807,11.717764 L6.61846584,10.8667462 L8.42191386,10.8667462 L8.56933259,11.8355489 L9.37251294,12.2178887 L9.32725231,10.8667462 L10.5755159,9.92544321 L10.5755159,9.11428598 L13.0409606,7.05265925 L12.887152,8.00663875 L13.362522,8.00663875 L13.5185842,7.2670335 L14.0780418,8.00663875 L14.5460875,7.4421105 L14.0780418,7.05265925 L13.6770408,6.36911245 L14.5460875,6.61940355 L15.1070945,6.36911245 L14.7275028,7.05265925 L15.8096561,7.59028508 L15.8096561,7.05265925 L15.4180921,6.61940355 L15.8096561,6.36911245 L15.8096561,5.73739859 L15.1070945,5.4118934 L15.1070945,4.48439378 L14.0780418,5.01582219 L14.0780418,4.24410306 L13.0409606,4.00550255 L12.4938978,4.48439378 L12.4938978,5.4118934 L11.8079565,5.4118934 L11.1841303,6.36911245 L11.0193354,5.4118934 L10.1354993,5.4118934 L9.57505576,4.48439378 L11.4434358,3.60929049 L11.8079565,4.00550255 L12.2950171,4.00550255 L12.4938978,3.60929049 L13.362522,2.86588229 L14.5460875,2.86588229 L14.5460875,3.22744516 L13.6770408,3.60929049 L15.1070945,4.24410306 L15.1070945,3.60929049 L15.8096561,3.78676194 L16.1933325,3.22744516 L15.5717599,3.22744516 L15.5717599,2.44502141 L14.2429776,1.76400992 L12.887152,2.16909555 L12.887152,2.86588229 L12.1207852,2.86588229 L12.1207852,2.44502141 L12.4938978,2.00655424 L11.4434358,2.00655424 L11.6075265,2.86588229 L9.96549296,3.22744516 L9.80802226,2.64446552 L10.8228491,2.44502141 L10.5755159,2.00655424 L9.80802226,2.16909555 L9.20673207,1.54907227 L8.42191386,1.76400992 L7.7918902,2.44502141 L9.20673207,3.22744516 L8.79150521,3.44252366 L6.72911438,2.51226646 C9.10855285,0.925147566 11.9672474,0 15.0420217,0 C18.8972954,0 22.4128672,1.4544372 25.0699696,3.84454426 L24.3595547,4.25607535 L24.3595547,4.74806566 L24.8737994,4.91257888 L25.0547921,5.41358361 L25.5666423,5.14765813 L25.7211551,5.91768705 L24.3595547,5.91768705 L24.0784174,6.85856746 L22.9899258,6.85856746 L23.2278221,7.93945313 L22.4049743,7.77226375 L21.4973345,7.93945313 L21.4973345,8.95597018 L21.9087584,9.46683444 L23.4499431,9.24978403 L24.0784174,8.10706505 L24.8737994,8.10706505 L25.0547921,7.77226375 L25.2891671,8.29876239 L26.551468,8.95597018 L25.7211551,8.95597018 L25.9305996,9.46683444 L26.551468,9.46683444 L26.7937306,8.58799861 L25.7211551,7.54817082 L26.3965326,7.54817082 L27.1213486,7.93945313 L27.1213486,8.80371094 L27.9267309,9.46683444 L28.0965965,8.29876239 L28.8088768,9.6278264 L29.0411782,9.60140644 C29.1779547,9.95584859 29.301658,10.3167904 29.4116968,10.6836407 L28.6284474,10.6836407 L28.4035094,10.2964431 L27.458826,10.1067176 L27.1937457,10.6836407 L25.4732585,10.1067176 L25.4732585,9.32654748 L23.3135999,9.78177584 L22.1797545,9.78177584 L21.2963411,10.2964431 L21.1283066,11.0575984 L19.4437363,12.2918701 L20.0865773,13.0513353 L19.7702274,13.4002216 L19.7702274,14.7735126 L21.1283066,16.4066726 L23.0634497,16.2576529 L23.6940368,15.7610145 L24.3595547,16.4066726 L25.3050832,16.4066726 L25.3050832,18.0618051 L26.2822326,19.5560866 L25.7256624,20.5754207 L25.7256624,21.2329102 L26.1917362,21.6164457 L26.1917362,22.9939622 L26.6709091,23.5298978 L26.7510854,24.3762557 C24.002084,27.8047703 19.7784145,30 15.0420217,30 C6.75775041,30 0.0420216574,23.2842712 0.0420216574,15 C0.0420216574,12.9121189 0.468597319,10.9238698 1.2393492,9.11765225 L1.41432672,9.92544321 Z M22.5301902,6.58644456 L23.6693879,6.58644456 L24.0250351,6.13276555 L23.2776127,5.35329965 L23.2776127,4.61144081 L22.3607472,4.85919659 L23.0155606,5.7824707 L22.5301902,6.13276555 L22.5301902,6.58644456 Z M22.1346824,5.40372408 L21.6148037,5.82979642 L21.6148037,6.46939791 L22.1346824,6.46939791 L22.5759666,5.82979642 L22.1346824,5.40372408 Z'
  )
)

export const globe = mk('globe', () => gglobe.get().d(-15, -15).scale(0.6))

export const globe1 = mk('globe1', () =>
  layers(
    S.circleShape(8.5).outline(1.5),
    S.circleShape(8).clip(gglobe.get().d(-15, -15).scale(0.6)).scale(1.02)
  )
)

export const star = mk('star', () => gstar.get().width(0.2).rounded())

export const starOpen = mk('starOpen', () =>
  gstar
    .get()
    .outline(1.5 / 8)
    .rounded()
)

export const gstar6 = mk('gstar6', () => S.starShape(6, 0.58).scale(8).rotate(-90))

export const star6 = mk('star6', () => gstar6.get().width(0.2).rounded())

export const star6Open = mk('star6Open', () =>
  gstar6
    .get()
    .outline(1.5 / 8)
    .rounded()
)

export const nautical = mk('Nautical', () =>
  layers(
    S.poly(pt(0, 0), pt(10, 0), Point.atAngle(36, 5)).array(5, (s, i) =>
      s.rotate(i * 72)
    ),
    S.starShape(5, 0.5)
      .scale(10)
      .outline(1 / 10)
      .rounded()
  ).rotate(-90)
)

export const scissors = mk('scissors', () =>
  S.path(
    'M-4.99249828,-3.05072739 C-5.1269722,-3.69842299 -3.80638128,-3.98579859 -4.34427714,-6.57658053 C-4.882173,-9.16736247 -7.06477039,-9.70784217 -9.44304157,-9.52878247 C-11.8213128,-9.34972278 -13.0869406,-7.16331874 -12.9953554,-5.03248634 C-12.9037703,-2.90165394 -10.9351576,-1.75753678 -9.48009265,-1.39721703 C-8.02502768,-1.03689716 -6.1144355,-0.855882674 -4.05721775,-0.207941547 C-2,0.43999958 -1,1.43999958 -0.0833699908,2.31209592 C1.08699475,3.42559952 0.27903387,2.84200858 4.94815747,4.94045005 C9.5150636,6.99295201 9.26115341,6.91292842 10.7834545,7.59709549 C12.3057557,8.28126266 13.9564943,7.92204304 14.9469375,7.70651129 C15.9373807,7.49097954 17.0562616,6.232061 17.0562616,6.232061 C17.0562616,6.232061 15,5.43999958 2.81916922,-0.101343689 C-2.84701477,-2.67902259 -4.87373896,-2.47872141 -4.99249828,-3.05072739 Z M-5.96208353,-6.05874201 C-5.6728176,-4.66548913 -6.58974779,-3.28547089 -8.01010443,-2.97638506 C-9.43046108,-2.66729924 -10.816384,-3.54619033 -11.1056499,-4.93944319 C-11.3949159,-6.33269607 -10.4779857,-7.71271427 -9.05762903,-8.02180011 C-7.63727239,-8.33088593 -6.25134946,-7.45199489 -5.96208353,-6.05874201 L-5.96208353,-6.05874201 Z'
  )
    .clone(s => s.scale2(1, -1))
    .scale(0.6)
)

export const lock = mk('lock', () =>
  layers(
    mask(
      layers(S.rect(8, 3), S.circleShape(4).dy(-1.5)),
      layers(S.rect(4, 3), S.circleShape(2).dy(-1.5))
      //
    ).dy(-1),
    S.rect(11, 8, 1).dy(4)
  )
)

export const lockOpen = mk('lockOpen', () =>
  layers(
    mask(
      layers(S.rect(8, 4), S.circleShape(4).dy(-2)),
      layers(S.rect(4, 4), S.circleShape(2).dy(-2), S.rect(4, 3).d(-3, 0.5))
    ).dy(-2),
    S.rect(11, 8, 1).dy(4)
  )
)

export const zoom = (r = 5.5) =>
  layers(
    S.circleShape(r).outline(2),
    S.line(pt(0, r + 0.5), pt(0, r + 0.5 + 4))
      .width(3)
      .rounded()
  ).rotate(-45)

export const search = mk('search', () => zoom().d(-1, -1))

export const zoomIn = mk('ZoomIn', () =>
  layers(zoom(6), gplus.get().scale(2.5).width(0.5)).d(-1, -1)
)

export const zoomOut = mk('ZoomOut', () =>
  layers(zoom(6), gdlight.get().scale(2.5).width(0.5)).d(-1, -1)
)

export const eye = mk('eye', () =>
  gshape(9, 6, 1, 6).mask(S.circleShape(3.5).outline(1.5))
)

export const contrast = mk('contrast', () =>
  layers(
    S.circleShape(8)
      .mask(S.rect(15, 30).dx(15 / 2))
      .rotate(45),
    S.line(pt(0, -12), pt(0, 12)).width(1).rounded().rotate(45),
    S.circleShape(8).outline(1.5)
  )
)

export const lowContrast = mk('LowContrast', () =>
  layers(
    layers(
      S.circleShape(8)
        .mask(S.rect(15, 30).dx(15 / 2))
        .clip(hstripes(2, 0.5)),
      S.line(pt(0, -12), pt(0, 12)).rounded().width(1)
    ).rotate(45),
    S.circleShape(8).outline(1.5)
  )
)

export const bright = mk('bright', () =>
  layers(
    S.line(pt(0, 6), pt(0, 8))
      .width(2)
      .rounded()
      .array(8, (s, i) => s.rotate(45 * i)),
    S.circleShape(3)
  )
)

export const dim = mk('dim', () =>
  layers(
    S.line(pt(0, 6.5), pt(0, 7))
      .width(2)
      .rounded()
      .array(8, (s, i) => s.rotate(45 * i)),
    S.circleShape(3)
  )
)

export const frame = mk('frame', () => S.rect(16, 16, 1).outline(1.5))

export const dialog = mk('dialog', () =>
  layers(
    frame.get(),
    S.line(pt(-8, -3), pt(8, -3)).width(0.5),
    S.line(pt(0.5, 5), pt(1.5, 5)).width(1.5).rounded(),
    S.line(pt(4, 5), pt(5, 5)).width(1.5).rounded()
  )
)

export const splits = mk('splits', () =>
  layers(
    frame.get(),
    S.line(pt(-8, 0), pt(8, 0)).width(0.5),
    S.line(pt(-3, 0), pt(-3, -8)).width(0.5),
    S.line(pt(3, 0), pt(3, 8)).width(0.5)
  )
)

export const vsplit = mk('vsplit', () =>
  layers(frame.get(), S.line(pt(-8, 0), pt(8, 0)).width(0.5))
)

export const hsplit = mk('hsplit', () => vsplit.get().rotate(90))

export const rows = mk('rows', () =>
  layers(
    frame.get(),
    S.line(pt(-8, -4), pt(8, -4)).width(0.5),
    S.line(pt(-8, 0), pt(8, 0)).width(0.5),
    S.line(pt(-8, 4), pt(8, 4)).width(0.5)
  )
)

export const columns = mk('columns', () => rows.get().rotate(90))

export const table = mk('table', () =>
  layers(
    frame.get(),
    S.line(pt(-8, -4), pt(8, -4)).width(1.5),
    S.line(pt(-8, 0), pt(8, 0)).width(0.5),
    S.line(pt(-8, 4), pt(8, 4)).width(0.5),
    S.line(pt(-4, 8), pt(-4, -4)).width(0.5),
    S.line(pt(0, 8), pt(0, -4)).width(0.5),
    S.line(pt(4, 8), pt(4, -4)).width(0.5)
  )
)

export const button = mk('button', () =>
  layers(S.rect(18, 12, 2).outline(1.5), S.text('OK').scale(0.6))
)

export const resize = mk('resize', () =>
  layers(
    S.line(pt(-1, 0), pt(1, 0)).rounded(),
    S.line(pt(0, -1), pt(1, 0), pt(0, 1)).rounded()
  )
    .dx(2)
    .array(4, (s, i) => s.rotate(45 + i * 90))
    .rotate(45)
    .scale(2.5)
    .width(0.5)
)

export const balloon = mk('balloon', () =>
  layers(
    S.rect(16, 16, 3).outline(1.5),
    S.line(pt(-5, 0), pt(5, 0))
      .width(0.5)
      .array(3, (s, i) => s.dy(-3 + i * 3)),
    handle.get().scale(-0.5).dy(8.5)
  )
)

export const tabs = mk('tabs', () =>
  layers(
    frame.get(),
    S.line(pt(-8 / 3, -8), pt(-8 / 3, -4)).width(1),
    S.line(pt(8 / 3, -8), pt(8 / 3, -4)).width(1),
    S.line(pt(-8 / 3 - 0.5, -4), pt(8, -4)).width(1),
    S.rect(11, 4).d(2.5, -6).clip(okStripes.get().scale(0.5))
  )
)

const prompt = () =>
  layers(
    gchevron.get().scale(2).width(0.7).d(-5, -3),
    S.line(pt(0, 1), pt(1, 1)).rounded().scale(2).width(0.7).d(-1, -3)
  )

export const terminal = mk('terminal', () => S.rect(16, 16, 2).mask(prompt()))

export const terminalLight = mk('terminalLight', () => layers(frame.get(), prompt()))

const codeLines = () =>
  layers(
    S.rect(2, 1.5, 1.5 / 2).d(0, -5),
    S.rect(5, 1.5, 1.5 / 2).d(3, -2),
    S.rect(3, 1.5, 1.5 / 2).d(2, 1),
    S.rect(3, 1.5, 1.5 / 2).d(0.5, 4)
  ).dy(0.5)

export const codeEditor = mk('codeEditor', () =>
  S.rect(16, 16, 2).mask(
    S.rect(1, 20).dx(-4),
    codeLines() //
  )
)

export const codeEditorLight = mk('codeEditorLight', () =>
  layers(
    frame.get(),
    S.rect(0.5, 16).dx(-4),
    codeLines() //
  )
)

export const sortable = mk('sortable', () =>
  layers(
    layers(
      S.rect(12, 4, 1).dy(-6).clip(okStripes.get()),
      S.rect(12, 16, 1).outline(1.5),
      S.line(pt(-6, -4), pt(6, -4)).width(1),
      S.line(pt(-6, 0), pt(6, 0)).width(0.5),
      S.line(pt(-6, 4), pt(6, 4)).width(0.5)
    ).mask(S.rect(12, 4).d(4, 0)),
    S.rect(12, 4).d(4, 0).outline(1)
  )
)

export const progress = mk('progress', () => {
  const w = 16
  const h = 3
  const m = 3
  const p = 0.7
  return layers(
    S.rect(w * p, h, h / 3).dx(-(w * (1 - p)) / 2), //
    S.rect(w + m, h + m, h / 1.5).outline(1)
  )
})

export const textInput = mk('textInput', () =>
  layers(
    mask(S.rect(18, 8, 2).outline(1.5), S.line(pt(-2, -7), pt(-2, 7)).width(5)),
    layers(
      S.line(pt(0, -7), pt(0, 7)).width(1.5),
      S.line(pt(-2, 8), pt(0, 7)).width(1.5),
      S.line(pt(0, 7), pt(2, 8)).width(1.5)
    )
      .rounded()
      .clone(s => s.scale(-1))
      .dx(-2)
  )
)

export const tag = mk('tag', () =>
  ((w = 8, h = 4, r = 2.7) =>
    S.poly(
      pt(-w, -h),
      pt(-w, h),
      pt(w - h, h),
      bz(pt(w - h + h * kappa, h), pt(w, h * kappa), pt(w, 0)),
      bz(pt(w, -h * kappa), pt(w - h + h * kappa, -h), pt(w - h, -h))
    )
      .width(2)
      .rounded()
      .mask(S.circleShape(r).dx(w - h))
      .rotate(-45))()
)

export const sliders = mk('sliders', () => {
  const handles = (r: number) =>
    layers(...[3, -3, 1].map((x, i) => S.circleShape(r).d(x, -5 + i * 5)))
  return layers(
    S.line(pt(-8, 0), pt(8, 0))
      .width(1.5)
      .rounded()
      .array(3, (s, i) => s.dy(-5 + i * 5))
      .mask(handles(3)),
    handles(2)
  )
})

const okStripes = once(() => hstripes(2, 0.7).rotate(-45).dx(1.4))

export const virtual = mk('virtual', () =>
  ((n: number) =>
    layers(
      S.line(pt(-n + 0.5, -10), pt(-n + 0.5, 10))
        .width(0.5)
        .array(4, (s, i) => s.rotate(i * 90)),
      S.rect(n * 2, n * 2, 1).outline(1),
      S.rect(n * 2, n * 2, 1).clip(okStripes.get())
    ))(5.5)
)

export const pattern = mk('pattern', () =>
  layers(
    gshape(8, 8, 6.5, 6.5).outline(1.5),
    gshape(8, 8, 6.5, 6.5).clip(okStripes.get()) //
  )
)

export const padding = mk('padding', () =>
  layers(
    S.rect(16, 16, 1).outline(1),
    S.rect(16, 16, 1)
      .clip(okStripes.get()) //
      .mask(S.rect(10, 10))
  )
)

export const margin = mk('margin', () =>
  layers(
    S.rect(12, 12, 1).outline(1),
    S.rect(18, 18)
      .clip(okStripes.get()) //
      .mask(S.rect(12, 12, 1))
  )
)

export const pulse = mk('pulse', () =>
  S.line(...[0, 0, -8, 8, -4, 0, 0].map((y, i) => pt(-9 + 3 * i, y)))
    .rounded()
    .width(1.5)
)

export const reload = mk('reload', () =>
  layers(
    mask(S.circleShape(7).outline(2), pieSlice(30, 90, 15)),
    S.circleShape(1).dx(7).rotate(-30),
    S.poly(pt(0, -1), pt(1, 0), pt(0, 1))
      .scale(3)
      .width(1.5 / 3)
      .dy(-7)
      .rounded()
  ).rotate(40)
)

export const reset = mk('reset', () =>
  layers(reload.get().rotate(-40), smallCross.get().scale(0.7))
)

export const checkbox = mk('checkbox', () =>
  layers(gshape(8, 8, 6.5, 6.5).outline(1), tick.get())
)

export const radioButton = mk('radioButton', () =>
  layers(circle.get().outline(1), circle.get().scale(0.3))
)

export const trash = mk('trash', () =>
  S.layers(
    S.rect(12, 16, 2).mask(
      S.rect(12, 4).dy(-7),
      ...[-3, 0, 3].map(x => S.line(pt(x, -3), pt(x, 6)).outline(1))
    ),
    S.rect(14, 2, 1).dy(-6.5),
    S.rect(5, 3, 1).dy(-7)
  )
)

export const inbox = mk('inbox', () =>
  layers(
    S.poly(
      pt(-8, -4),
      pt(-4, -4),
      pt(-2, -1),
      pt(2, -1),
      pt(4, -4),
      pt(8, -4),
      pt(8, 3),
      pt(-8, 3)
      //
    ).width(1.5),
    S.line(
      pt(-8, -4),
      pt(-5, -10),
      pt(5, -10),
      pt(8, -4)
      //
    ).outline(1.2)
  )
    .dy(3)
    .rounded()
)

export const module = mk('module', () => {
  const v = 2
  const w = 4
  const h = 4.5
  const box = layers(
    S.poly(
      pt(0, 0),
      pt(w, -v),
      pt(w, -v - h),
      pt(0, -v - v - h),
      pt(-w, -v - h),
      pt(-w, -v),
      pt(0, 0)
    )
      .outline(1)
      .rounded(),
    S.line(pt(0, 0), pt(0, -h)).outline(0.6),
    S.line(pt(0, -h), pt(w, -v - h)).outline(0.6),
    S.line(pt(0, -h), pt(-w, -v - h)).outline(0.6)
  )

  return layers(
    box.d(0, 0),
    box.d(w, v + h),
    box.d(-w, v + h) //
  ).dy(1)
})

export const expression = mk('expression', () =>
  S.text('e:τ', 100, 'Ubuntu Mono, Monaco, Courier').scale(0.9).dx(0.5)
)

// ----------------------------------------------------------------------------

export const iconize = (shape: Once<Shape>): Once<Shape> => {
  return shape.map(s => offsetAsIcon(clipAsIcon(s)))
}

export const iconizeNoClip = (shape: Once<Shape>): Once<Shape> => {
  return shape.map(s => offsetAsIcon(s))
}

export const Empty = iconize(empty)
export const Square = iconize(square)
export const Blob = iconize(blob)
export const Circle = iconize(circle)
export const Marker = iconize(marker)
export const Ellipse = iconize(ellipse)
export const Triangle = iconize(triangle)
export const Dot = iconize(dot)
export const Ring = iconize(ring)
export const Target = iconize(target)
export const Asterisk = iconize(asterisk)
export const CaretRight = iconize(caretRight)
export const CaretLeft = iconize(caretLeft)
export const CaretUp = iconize(caretUp)
export const CaretDown = iconize(caretDown)
export const ChevronRight = iconize(chevronRight)
export const ChevronLeft = iconize(chevronLeft)
export const ChevronUp = iconize(chevronUp)
export const ChevronDown = iconize(chevronDown)
export const ArrowRight = iconize(arrowRight)
export const ArrowLeft = iconize(arrowLeft)
export const ArrowUp = iconize(arrowUp)
export const ArrowDown = iconize(arrowDown)
export const DoubleChevronRight = iconize(doubleChevronRight)
export const DoubleChevronLeft = iconize(doubleChevronLeft)
export const DoubleChevronUp = iconize(doubleChevronUp)
export const DoubleChevronDown = iconize(doubleChevronDown)
export const Minus = iconize(minus)
export const Plus = iconize(plus)
export const SmallPlus = iconize(smallPlus)
export const Cross = iconize(cross)
export const SmallCross = iconize(smallCross)
export const Tick = iconize(tick)
export const Stop = iconize(stop)
export const Add = iconize(add)
export const Del = iconize(del)
export const Alert = iconize(alert)
export const Help = iconize(help)
export const Warning = iconize(warning)
export const StopOpen = iconize(stopOpen)
export const AddOpen = iconize(addOpen)
export const DelOpen = iconize(delOpen)
export const AlertOpen = iconize(alertOpen)
export const HelpOpen = iconize(helpOpen)
export const LeftRight = iconize(leftRight)
export const UpDown = iconize(upDown)
export const RightLeft = iconize(rightLeft)
export const DownUp = iconize(downUp)
export const Splith = iconize(splith)
export const Splitv = iconize(splitv)
export const Joinh = iconize(joinh)
export const Joinv = iconize(joinv)
export const Camera = iconize(camera)
export const Grid = iconize(grid)
export const Settings6 = iconize(settings6)
export const Settings8 = iconize(settings8)
export const MapMarker = iconize(mapMarker)
export const MapMarkerO = iconize(mapMarkerO)
export const Globe = iconize(globe)
export const Globe1 = iconize(globe1)
export const Star = iconize(star)
export const StarOpen = iconize(starOpen)
export const Star6 = iconize(star6)
export const Star6Open = iconize(star6Open)
export const Nautical = iconize(nautical)
export const Scissors = iconize(scissors)
export const Lock = iconize(lock)
export const LockOpen = iconize(lockOpen)
export const Ellipses = iconize(ellipses)
export const Hamburger = iconize(hamburger)
export const Dots = iconize(dots)
export const Eye = iconize(eye)
export const Contrast = iconize(contrast)
export const LowContrast = iconize(lowContrast)
export const Bright = iconize(bright)
export const Dim = iconize(dim)
export const Frame = iconize(frame)
export const Rows = iconize(rows)
export const Columns = iconize(columns)
export const Hsplit = iconize(hsplit)
export const Vsplit = iconize(vsplit)
export const Splits = iconize(splits)
export const Table = iconize(table)
export const Dialog = iconize(dialog)
export const Tabs = iconize(tabs)
export const TerminalLight = iconize(terminalLight)
export const Terminal = iconize(terminal)
export const CodeEditor = iconize(codeEditor)
export const CodeEditorLight = iconize(codeEditorLight)
export const Button = iconize(button)
export const Sortable = iconize(sortable)
export const Progress = iconize(progress)
export const Search = iconize(search)
export const ZoomIn = iconize(zoomIn)
export const ZoomOut = iconize(zoomOut)
export const Resize = iconize(resize)
export const Virtual = iconize(virtual)
export const Sliders = iconize(sliders)
export const Pattern = iconize(pattern)
export const Padding = iconize(padding)
export const Margin = iconize(margin)
export const Pulse = iconize(pulse)
export const Balloon = iconize(balloon)
export const TextInput = iconize(textInput)
export const Tag = iconize(tag)
export const Reload = iconize(reload)
export const Reset = iconize(reset)
export const Checkbox = iconize(checkbox)
export const RadioButton = iconize(radioButton)
export const Trash = iconize(trash)
export const Inbox = iconize(inbox)
export const Module = iconize(module)
export const Expression = iconize(expression)

export const Icons: { [key: string]: Once<Shape> } = {
  Empty,
  Square,
  Blob,
  Circle,
  Marker,
  Ellipse,
  Triangle,
  Dot,
  Ring,
  Target,
  Asterisk,
  CaretRight,
  CaretLeft,
  CaretUp,
  CaretDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  DoubleChevronRight,
  DoubleChevronLeft,
  DoubleChevronUp,
  DoubleChevronDown,
  Minus,
  Plus,
  SmallPlus,
  Cross,
  SmallCross,
  Tick,
  Stop,
  Add,
  Del,
  Alert,
  Help,
  Warning,
  StopOpen,
  AddOpen,
  DelOpen,
  AlertOpen,
  HelpOpen,
  LeftRight,
  UpDown,
  RightLeft,
  DownUp,
  Splith,
  Splitv,
  Joinh,
  Joinv,
  Camera,
  Grid,
  Settings6,
  Settings8,
  MapMarker,
  MapMarkerO,
  Globe,
  Globe1,
  Star,
  StarOpen,
  Star6,
  Star6Open,
  Nautical,
  Scissors,
  Lock,
  LockOpen,
  Ellipses,
  Hamburger,
  Dots,
  Eye,
  Contrast,
  LowContrast,
  Bright,
  Dim,
  Frame,
  Rows,
  Columns,
  Hsplit,
  Vsplit,
  Splits,
  Table,
  Dialog,
  Tabs,
  TerminalLight,
  Terminal,
  CodeEditor,
  CodeEditorLight,
  Button,
  Sortable,
  Progress,
  Search,
  ZoomIn,
  ZoomOut,
  Resize,
  Virtual,
  Sliders,
  Pattern,
  Padding,
  Margin,
  Pulse,
  Balloon,
  TextInput,
  Tag,
  Reload,
  Reset,
  Checkbox,
  RadioButton,
  Trash,
  Inbox,
  Module,
  Expression
}
