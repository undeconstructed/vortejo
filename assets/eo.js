
// Kodo:
// k kerna
// f finaĵo
// p prefikso
// s sufikso
// r (normala) radiko
// t tabelvorto
// k kerna
// n pronomo

const normoj = [
  /^p+([rtnksp]f*)+f+$/,
  /^([rtnksp]f*)+s+f+$/,
  /^([rtnksp]f*)+f+$/,
  /^([rtnksp]f*)*k$/
]

// XXX j, n, jn nur validas post tiu, tio ktp
const enajFinaĵoj = /^(([ao]j?n?)|e)$/
const finajFinaĵoj = /^(i|([iaou]s)|u|j|jn|n)$/

class Dividulo {
  constructor(radikoj) {
    this.radikoj = this._umuRadikoj(radikoj)
  }

  _umuRadikoj(rj) {
    let m = new Map()
    for (let e of rj) {
      if (e.fakoj.includes('litera')) {
        // liternomoj estas maloftaj ke nekonvenaj
        continue
      }

      let kj = {
        r: e.radiko,
        o: e,
        t: 'r'
      }

      if (kj.r.endsWith('/')) {
        kj.r = kj.r.slice(0, -1)
        if (e.fakoj.includes('sufikso')) {
          kj.t = 's'
        } else if (e.fakoj.includes('prefikso')) {
          kj.t = 'p'
        }
      } else if (kj.r.startsWith('-')) {
        kj.r = kj.r.slice(1)
        kj.t = 'f'
      // } else if (e.fakoj.includes('pronomo')) {
      //   kj.t = 'n'
      // } else if (e.fakoj.includes('tabela')) {
      //   kj.t = 't'
      } else {
        kj.t = 'k'
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
      let poentoj = -a.length
      let eraroj = []

      let skemo = ''
      let finaĵoj = ''
      for (let e of a) {
        skemo += e.t
        if (e.t != 'f') {
          if (finaĵoj && !enajFinaĵoj.test(finaĵoj)) {
            eraroj.push('ne eblaj enaj finaĵoj: ' + finaĵoj)
            poentoj--
          }
          finaĵoj = ''
          continue
        }
        finaĵoj += e.r
      }

      if (finaĵoj) {
        if (!enajFinaĵoj.test(finaĵoj) && !finajFinaĵoj.test(finaĵoj)) {
          eraroj.push('ne eblaj finaj finaĵoj: ' + finaĵoj)
          poentoj--
        }
      } else {
        let lt = a[a.length-1].t
        if (lt == 'r') {
          eraroj.push('finaĵo mankas')
          poentoj--
        }
      }

      if (a[0].t == 'f') {
        eraroj.push('finaĵo ĉe komenco')
        poentoj--
      }

      if (eraroj.length == 0) {
        for (let e of a) {
          // if (e.t == 's') {
          //   // ĉiu amas sufiksojn
          //   poentoj++
          // }
        }
        for (let n of normoj) {
          if (n.test(skemo)) {
            poentoj++
          }
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
