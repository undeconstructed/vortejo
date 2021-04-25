
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
// f finaĵo
// a artikolo
// n pronomo
// t tabelvorto
// x prepozicio
// k konjunkcio
// 0 nombro
// e alia esperanta aĵo
// r (normala) radiko

const normoj = function() {
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
      if (e.skemo == 'f') {
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

  function kunNormalFinaĵoj(teksto, t) {
    return kontroluFinaĵoj(t,
      f => vortFinaĵoj.test(f),
      f => vortFinaĵoj.test(f) || verbFinaĵoj.test(f))
  }

	function ebleNormalFinaĵoj(teksto, t) {
    return kontroluFinaĵoj(t,
      f => vortFinaĵoj.test(f),
      f => vortFinaĵoj.test(f) || verbFinaĵoj.test(f) || neniuFinaĵoj.test(f))
	}

  function kunPronomFinaĵoj(teksto, t) {
    return kontroluFinaĵoj(t,
      f => false,
      f => pronomFinaĵoj.test(f))
  }

  const tabelFinaĵoj = /(i|ĉi|ki|ti|neni)((((a|o|u)j?n?))|(al|am|e|el|es|om))$/
  function kunTabelFinaĵoj(teksto, t) {
    return tabelFinaĵoj.test(teksto)
  }

  let ŝablonoj = [
    // plej oftaj aferoj ..
    { skemo: /^[ntxk0ea]$/ },
    // tabelvorto, eble kun finaĵo
    { skemo: /^[t]f*$/, kaj: kunTabelFinaĵoj },
    // kio ne bezonas finaĵon
    { skemo: /^([etnxr0]f?)*[etxk]+f*$/, kaj: ebleNormalFinaĵoj },
    // numerojn
    { skemo: /^[0]+f*$/, kaj: ebleNormalFinaĵoj },
    // pronomo, eble kun finaĵo
    { skemo: /^[n]f*$/, kaj: kunPronomFinaĵoj },
    // normalaj vortoj
    { skemo: /^([r]f?)+f+$/, kaj: kunNormalFinaĵoj },
    // ĝenerala miksaĵo de ĉio
    { skemo: /^([ketnxr0]f?)+f+$/, kaj: kunNormalFinaĵoj },
  ]

  return ŝablonoj.map(e => (teksto, eblaVorto, skemo) => {
    if (e.skemo.test(skemo)) {
      if (!e.kaj || e.kaj(teksto, eblaVorto)) {
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
				speco: e.speco,
        skemo: 'r'
      }

      if (kj.r.endsWith('\'')) {
        kj.r = kj.r.slice(0, -1)
      } else if (kj.r.startsWith('-')) {
        kj.r = kj.r.slice(1)
        kj.skemo = 'f'
      } else if (e.fakoj.includes('artikolo')) {
        kj.skemo = 'a'
      }  else if (e.fakoj.includes('pronomo')) {
        kj.skemo = 'n'
      } else if (e.fakoj.includes('tabelvorto')) {
        kj.skemo = 't'
      } else if (e.fakoj.includes('prepozicio')) {
        kj.skemo = 'x'
      } else if (e.fakoj.includes('nombro')) {
        kj.skemo = '0'
      } else if (e.fakoj.includes('konjunkcio')) {
        kj.skemo = 'k'
      } else {
        kj.skemo = 'e'
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
				teksto: teksto,
        ebloj: [{
					vorto: teksto,
          eraro: [ 'ne komprenebla' ]
        }]
      }
    }

    vj = vj.map(eblaVorto => {
			// konstrui skemo de vorto
			let skemo = ''
			for (let parto of eblaVorto) {
				skemo += parto.skemo
			}

			let nivelo = 0
      let poentoj = 0
      let eraroj = []

			// kompari skemo kontraŭ normoj
      for (let n of normoj) {
        if (n(teksto, eblaVorto, skemo)) {
          poentoj += 1
        }
      }
			if (poentoj > 0) {
				poentoj += 100
			} else {
				poentoj -= 100
        eraroj.push('ne konformas al iu normo')
      }

			// kalkuli poentojn kaj tutan nivelon
			let plejlonga = 0
      for (let parto of eblaVorto) {
				let partNivelo = parto.o.nivelo
				if (parto.skemo == 'f') {
					// ne havu efekton
				} else if (parto.speco == 'e') {
					poentoj += 1
				} else {
					poentoj -= partNivelo
				}
				if (parto.r.length > plejlonga) {
					plejlonga = parto.r.length
				}
				if (partNivelo > nivelo) {
					nivelo = partNivelo
				}
      }
			poentoj += plejlonga
			// if (eblaVorto[eblaVorto.length-1].skemo == 'f') {
			// 	poentoj++
			// }

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
      return b.poentoj - a.poentoj
    })

    return {
			teksto: teksto,
			ebloj: vj
		}
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
