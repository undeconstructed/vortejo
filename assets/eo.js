
class Dividulo {
  constructor(radikoj) {
    this.radikoj = this._umuRadikoj(radikoj)
  }

  _umuRadikoj(rj) {
    let m = new Map()
    for (let e of rj) {
      if (e.fakoj.includes('litera')) {
        continue
      }
      let r = e.radiko

      let streko = r.indexOf('/')
      let dashĈeKomenco = r.startsWith('-')
      let dashĈeFino = r.endsWith('-')

      let kj = {
        o: e
      }
      if (streko >= 0) {
        kj.radiko = r.slice(0, streko)
      } else if (dashĈeKomenco && !dashĈeFino) {
        kj.radiko = r.slice(1)
        kj.finaĵo = true
      } else if (dashĈeKomenco && dashĈeFino) {
        kj.radiko = r.slice(1).slice(0, -1)
        kj.enfikso = true
      } else {
        kj.radiko = r
        kj.fina = true
      }
      if (e.fakoj.includes('litera')) {
        kj.litero = true
      }
      if (e.fakoj.includes('pronomo') || e.fakoj.includes('tabela')) {
        kj.tipo = 'o'
      }
      if (e.fakoj.includes('xxx')) {
        kj.xxx = true
        kj.vidu = e.vidu
      }

      // kuniĝis erojn kun sama radiko
      let x = m.get(kj.radiko)
      if (x) {
        for (let p in x) {
          kj[p] = x[p]
        }
      }
      m.set(kj.radiko, kj)
    }

    return m
  }

  komprenuVorton(teksto) {
    let vj = this.provuDividi(teksto)

    if (vj.length == 0) {
      return ([{
        vorto: teksto,
        eraro: [ 'ne komprenebla' ],
        poentoj: -100
      }])
    }

    let altj = vj.map((a) => {
      let pj = 0
      let l = a.length
      let eraro = []
      let estAk = false
      let estPl = false
      let tipo = null
      // kontrolu finaĵojn
      let finoj = 0
      for (let i = l-1; i >= 0; i--) {
        let ero = a[i]
        if (!ero.finaĵo) {
          break
        }
        finoj++
        if (ero.radiko === 'n') {
          if (estAk || estPl || tipo) {
            eraro.push('n ne ĉe la fino')
            pj -= 10
          } else {
            estAk = true
          }
        } else if (ero.radiko === 'j') {
          if (tipo) {
            eraro.push('j antaŭ tipo')
            pj -= 10
          } else {
            estPl = true
          }
        } else if (ero.radiko === 'a' || ero.radiko === 'o') {
          if (tipo) {
            eraro.push('duobla tipo: ' + ero.radiko)
            pj -= 10
          } else {
            tipo = ero.radiko
          }
        } else if (ero.radiko === 'e') {
          if (estAk || estPl || tipo) {
            eraro.push('e finaĵo ne ĉe la fino')
            pj -= 10
          } else {
            tipo = ero.radiko
          }
        } else if (ero.radiko === 'i' || ero.radiko === 'u' || ero.radiko === 'as' || ero.radiko === 'os' || ero.radiko === 'is' || ero.radiko === 'us') {
          if (estAk || estPl || tipo) {
            eraro.push('problema finaĵo: ' + ero.radiko)
            pj -= 10
          } else {
            tipo = 'verbo'
          }
        } else {
          console.log(ero)
        }
      }
      // kontrolu antaŭ finaĵoj
      for (let i = 0; i < a.length - finoj; i++) {
        let ero = a[i]
        if (ero.litero) {
          eraro.push('uzo de liternomo: ' + ero.radiko)
          pj -= 10
        } else if (ero.radiko === 'a' || ero.radiko === 'e' || ero.radiko === 'o') {
          // XXX - kontrolu ke estas nur unu kaj estas malantaŭ io
        } else if (ero.finaĵo) {
          eraro.push('neatenda finaĵo en vorto: ' + ero.radiko)
          pj -= 10
        }
        if (ero.xxx) {
          eraro.push(`xxx vorto: ${ero.radiko}, vidu: ${ero.vidu}`)
        }
        if (!tipo && ero.tipo) {
          tipo = ero.tipo
        }
      }
      let lasta = a[a.length-1]
      if (!tipo && !lasta.fina) {
        eraro.push('nekonata tipo')
        pj -= 20
      }
      if (!lasta.finaĵo && !lasta.fina) {
        eraro.push('ne havas finaĵon')
        pj -= 20
      }
      if (lasta.finaĵo) {
        pj += 1
      }
      // ...
      return {
        vorto: a.map(e => e.radiko).join('/'),
        eroj: a,
        akuzativo: estAk,
        pluralo: estPl,
        tipo: tipo,
        poentoj: pj,
        eraro: eraro.length > 0 ? eraro : null
      }
    })

    altj.sort((a, b) => {
      let d = b.poentoj - a.poentoj
      if (d) {
        return d
      }
      return a.eroj.length - b.eroj.length
    })

    return altj
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
      if (r) {
        let k = komenco.slice(0)
        k.push(r)
        let c = cetero.slice(s.length)
        if (c.length > 0) {
          this.dividu(k, c, metejo)
        } else {
          metejo.push(k)
        }
      }
    }
  }
}