
const LETTERS = [..."'abcĉdefgĝhĥijĵklmnoprsŝtuŭvz"]

function runeIndex(r) {
	for (let i = 0; i < LETTERS.length; i++) {
		if (LETTERS[i] == r) {
			return i
		}
	}
	return -1
}

function eoCompare(a, b) {
  let aRunes = [...a]
  let bRunes = [...b]
  let aDash = false

	if (aRunes[0] == '-') {
		aRunes = aRunes.slice(1)
		aDash = true
	}
	if (bRunes[0] == '-') {
		bRunes = bRunes.slice(1)
	}

  let aLen = aRunes.length
  let bLen = bRunes.length

	for (let ci = 0, cj = 0; ci < aLen && cj < bLen; ci++, cj++) {
		li = aRunes[ci]
    lj = bRunes[cj]
		let ni = runeIndex(li)
		let nj = runeIndex(lj)
		if (ni < nj) {
			return -1
		}
		if (ni > nj) {
			return 1
		}
	}

	if (aLen < bLen) {
		return -1
	}
	if (aLen > bLen) {
		return 1
	}
	return aDash ? 1 : -1
}

// Kodo:
// k kerna
// t tabelvorto
// n pronomo
// x prepozicio
// r (normala) radiko
// f finaĵo

const normoj = function() {
  const tabelFinaĵoj = /^(j|jn|n)$/
  const pronomFinaĵoj = /^((aj?n?)|n)$/
  const vortFinaĵoj = /^(([ao]j?n?)|en?)$/
  const verbFinaĵoj = /^(i|([iaou]s)|u)$/
	const neniuFinaĵoj = /^$/

	/**
	 * t testato
	 * f1 testo por mezvortaj finaĵoj
	 * f2 testo for finaj finaĵoj
	 */
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

  function kunNormalFinaĵoj(t) {
    return kontroluFinaĵoj(t,
      f => vortFinaĵoj.test(f),
      f => vortFinaĵoj.test(f) || verbFinaĵoj.test(f))
  }

	function ebleNormalFinaĵoj(t) {
    return kontroluFinaĵoj(t,
      f => vortFinaĵoj.test(f),
      f => vortFinaĵoj.test(f) || verbFinaĵoj.test(f) || neniuFinaĵoj.test(f))
	}

  function kunTabelFinaĵoj(t) {
    return kontroluFinaĵoj(t,
      f => false,
      f => tabelFinaĵoj.test(f))
  }

  function kunPronomFinaĵoj(t) {
    return kontroluFinaĵoj(t,
      f => false,
      f => pronomFinaĵoj.test(f))
  }

  let ŝablonoj = [
    // konjunkcio ..
    { skemo: /^k$/ },
    // kio ne bezonas finaĵon
    { skemo: /^r*[e|t|n|x]+f*$/, kaj: ebleNormalFinaĵoj },
    // numerojn
    { skemo: /^[0]+f*$/, kaj: ebleNormalFinaĵoj },
    // pronomo, eble kun finaĵo
    { skemo: /^[n]f*$/, kaj: kunPronomFinaĵoj },
    // tabelvorto, eble kun finaĵo
    { skemo: /^r*[t]f*$/, kaj: kunTabelFinaĵoj },
    // ĝenerala miksaĵo de ĉio
    { skemo: /^([etnxr0]f?)+f+$/, kaj: kunNormalFinaĵoj },
  ]

  return ŝablonoj.map(e => (eblaVorto, s) => {
    if (e.skemo.test(s)) {
      if (!e.kaj || e.kaj(eblaVorto)) {
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
        // liternomoj estas maloftaj kaj nekonvenaj
        continue
      }

      let kj = {
        r: e.radiko,
        o: e,
        t: 'r',
        bona: true
      }

      if (kj.r.endsWith('\'')) {
        kj.r = kj.r.slice(0, -1)
      } else if (kj.r.startsWith('-')) {
        kj.r = kj.r.slice(1)
        kj.t = 'f'
      } else if (e.fakoj.includes('pronomo')) {
        kj.t = 'n'
      } else if (e.fakoj.includes('tabelvorto')) {
        kj.t = 't'
      } else if (e.fakoj.includes('prepozicio')) {
        kj.t = 'x'
      } else if (e.fakoj.includes('nombro')) {
        kj.t = '0'
      } else if (e.fakoj.includes('konjunkcio')) {
        kj.t = 'k'
      } else {
        kj.t = 'e'
      }

      if (!e.bona) {
        kj.bona = false
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

    vj = vj.map(eblaVorto => {
			let skemo = ''
			for (let parto of eblaVorto) {
				skemo += parto.t
			}

			let nivelo = 0
      let poentoj = 0
      let eraroj = []

      for (let n of normoj) {
        if (n(eblaVorto, skemo)) {
          poentoj = 1
        }
      }
      if (poentoj == 0) {
        eraroj.push('ne konformas al iu skemo')
      }

      for (let parto of eblaVorto) {
				let partNivelo = parto.o.nivelo
				if (parto.t != 'f') {
					poentoj -= 1
				}
        poentoj -= partNivelo
				if (partNivelo > nivelo) {
					nivelo = partNivelo
				}
      }

      // ...
      return {
        vorto: eblaVorto.map(e => e.r).join('/'),
				nivelo: nivelo,
        skemo: skemo,
        poentoj: poentoj,
        eroj: eblaVorto,
        eraro: eraroj.length > 0 ? eraroj : null
      }
    })

    vj.sort((a, b) => {
      let d = b.poentoj - a.poentoj
      if (d) {
        return d
      }
      return a.eroj.length - b.eroj.length
    })

    let bonaj = vj.filter(e => e.eraro == null)
    let malbonaj = vj.filter(e => e.eraro != null)

    return { bonaj, malbonaj }
  }

  provuDividi(teksto) {
		let simboloj = [...teksto]
    let metejo = []
    this.dividu([], simboloj, 0, metejo)
    return metejo
  }

  dividu(ĉeno, simboloj, ekde, metejo) {
		if (ekde == simboloj.length) {
			if (ĉeno.length > 0) {
      	metejo.push(ĉeno)
			}
			return
		}

		let eblaRadiko = ''
    for (let i = ekde; i < simboloj.length; i++) {
			let simbolo = simboloj[i]
			if (simbolo == '-') {
				if (eblaRadiko == '') {
					continue
				} else {
        	return
				}
			}
			eblaRadiko += simbolo
      let radiko = this.radikoj.get(eblaRadiko)
      while (radiko) {
        let ĉeno1 = ĉeno.slice(0)
        ĉeno1.push(radiko)
        this.dividu(ĉeno1, simboloj, i+1, metejo)
        radiko = radiko.s
      }
    }
  }
}
