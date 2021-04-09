
// Kodo:
// k kerna
// p prefikso
// s sufikso
// t tabelvorto
// n pronomo
// x prepozicio
// r (normala) radiko
// f finaĵo

const normoj = function() {
  const tabelFinaĵoj = /^(j|jn|n)$/
  const pronomFinaĵoj = /^((aj?n?)|n)$/
  const vortajFinaĵoj = /^(([ao]j?n?)|en?)$/
  const verbajFinaĵoj = /^(i|([iaou]s)|u)$/

  function kontroluFinaĵoj(t, f1, f2) {
    let finaĵoj = ''
    for (let e of t) {
      if (e.t == 'f') {
        finaĵoj += e.r
      } else {
        if (finaĵoj && !f1(finaĵoj)) {
          return false
        }
        finaĵoj = ''
      }
    }
    if (finaĵoj && !f2(finaĵoj)) {
      return false
    }
    return true
  }

  function kontroluĜeneralFinaĵoj(t) {
    return kontroluFinaĵoj(t,
      f => vortajFinaĵoj.test(f),
      f => vortajFinaĵoj.test(f) || verbajFinaĵoj.test(f))
  }

  function kontroluTabelFinaĵoj(t) {
    return kontroluFinaĵoj(t,
      f => false,
      f => tabelFinaĵoj.test(f))
  }

  function kontroluPronomFinaĵoj(t) {
    return kontroluFinaĵoj(t,
      f => false,
      f => pronomFinaĵoj.test(f))
  }

  // eble, la plej uzata vortoj konformas al pli da skemoj?
  let l = [
    { skemo: /^p*[k|t|n|x]$/ },
    { skemo: /^p*[k|x]f*$/, kaj: kontroluĜeneralFinaĵoj },
    { skemo: /^[n]f*$/, kaj: kontroluPronomFinaĵoj },
    { skemo: /^[t]f*$/, kaj: kontroluTabelFinaĵoj },
    { skemo: /^([kpstnxr])+f+$/, kaj: kontroluĜeneralFinaĵoj },
  ]

  return l.map(e => (t, s) => {
    if (e.skemo.test(s)) {
      if (!e.kaj || e.kaj(t)) {
        return true
      }
    }
    return false
  })
}()

class Dividulo {
  constructor(radikoj) {
    this.radikoj = this._umuRadikoj(radikoj)
  }

  _umuRadikoj(rj) {
    let m = new Map()
    for (let e of rj) {
      if (e.fakoj.includes('litero')) {
        // liternomoj estas maloftaj ke nekonvenaj
        continue
      }

      let kj = {
        r: e.radiko,
        o: e,
        t: 'r'
      }

      if (kj.r.endsWith('\'')) {
        kj.r = kj.r.slice(0, -1)
        if (e.fakoj.includes('sufikso')) {
          kj.t = 's'
        } else if (e.fakoj.includes('prefikso')) {
          kj.t = 'p'
        }
      } else if (kj.r.startsWith('-')) {
        kj.r = kj.r.slice(1)
        kj.t = 'f'
      } else if (e.fakoj.includes('pronomo')) {
        kj.t = 'n'
      } else if (e.fakoj.includes('tabela')) {
        kj.t = 't'
      } else if (e.fakoj.includes('prepozicio')) {
        kj.t = 'x'
      } else {
        kj.t = 'k'
      }

      if (e.fakoj.includes('ĝenerala')) {
        kj.ĝenerala = true
      }
      if (e.fakoj.includes('xxx')) {
        kj.xxx = true
        kj.vidu = e.vidu
      }

      // se radiko jam ekzistas, aldoni al listo
      let x = m.get(kj.r)
      if (x) {
        while (x.s) {
          x = x.s
        }
        x.s = kj
      } else {
        m.set(kj.r, kj)
      }
    }

    return m
  }

  komprenuVorton(teksto) {
    let vj = this.provuDividi(teksto)

    if (vj.length == 0) {
      return {
        bonaj: [],
        malbonaj: [{
          vorto: teksto,
          eraro: [ 'ne komprenebla' ]
        }]
      }
    }

    let altj = vj.map((a) => {
      let poentoj = 0
      let eraroj = []

      let skemo = ''
      for (let e of a) {
        skemo += e.t
      }

      for (let n of normoj) {
        if (n(a, skemo)) {
          poentoj = 1
        }
      }
      if (poentoj == 0) {
        eraroj.push('ne konformas al iu skemo')
      }

      for (let e of a) {
        // eble ĝeneralaj vortoj estas pli verŝajne? ĝenerale?
        if (e.ĝenerala) {
          poentoj++
        }
      }

      // ...
      return {
        vorto: a.map(e => e.r).join('/'),
        skemo: skemo,
        poentoj: poentoj,
        eroj: a,
        eraro: eraroj.length > 0 ? eraroj : null
      }
    })

    altj.sort((a, b) => {
      let d = b.poentoj - a.poentoj
      if (d) {
        return d
      }
      return a.eroj.length - b.eroj.length
    })

    let bonaj = altj.filter(e => e.eraro == null)
    let malbonaj = altj.filter(e => e.eraro != null)

    return { bonaj, malbonaj }
  }

  provuDividi(teksto) {
    let metejo = []
    this.dividu([], teksto, metejo)
    return metejo
  }

  dividu(komenco, cetero, metejo) {
    for (let i = 1; i <= cetero.length; i++) {
      let s = cetero.slice(0, i)
      let r = this.radikoj.get(s)
      while (r) {
        let k = komenco.slice(0)
        k.push(r)
        let c = cetero.slice(s.length)
        if (c.length > 0) {
          this.dividu(k, c, metejo)
        } else {
          metejo.push(k)
        }
        r = r.s
      }
    }
  }
}
