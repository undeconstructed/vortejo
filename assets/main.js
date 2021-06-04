document.addEventListener('DOMContentLoaded', () => {
  let eS = document.querySelector("#ŝirmilo")
  let eM = eS.querySelector(".montrilo")

  eS.addEventListener("click", (e) => {
    if (e.target == eS) {
      eS.hidden = true
    }
  })

  function montru(e) {
    malplenigu(eM)
    eM.append(e)
    eS.hidden = false
  }

  window.montru = montru
})

document.addEventListener('DOMContentLoaded', () => {
  let hj = document.querySelector('main').querySelectorAll('h1,h2,h3,h4,h5,h6')
  for (let h of hj) {
    if (h.id) {
      let a = document.createElement('a')
      a.href = '#' + h.id
      a.classList.add('para')
      a.textContent = '¶'
      h.append(a)
    }
  }
})

// document.addEventListener('DOMContentLoaded', () => {
//   document.addEventListener('selectionchange', () => {
//     console.log(document.getSelection());
//   })
// })

function malplenigu(e) {
  e.replaceChildren()
}

function montruRadiko(r) {
  let eM = document.querySelector('#unuvorto')
  let ra = eM.querySelector('[f=ra]')
  ra.textContent = r.radiko
  ra.className = 'nivelo-' + r.nivelo
  eM.querySelector('[f=fo]').textContent = r.fonto
  eM.querySelector('[f=sp]').textContent = r.speco
  eM.querySelector('[f=fa]').textContent = r.fakoj.join(', ')
  eM.querySelector('[f=vi]').textContent = r.vidu
  eM.querySelector('[f=an]').textContent = r.tradukoj['en']
  eM.hidden = false
  montru(eM)
}

function mkel(tag, opts) {
  opts = opts || {}
  let e = document.createElement(tag)
  for (let opt in opts) {
    switch (opt) {
      case 'classes':
        e.classList.add(...opts.classes)
        break
      case 'text':
        e.textContent = opts.text
        break
      default:
        e[opt] = opts[opt]
    }
  }
  return e
}

function montruEraro(e, eraro) {
  console.log(eraro)
  montruTeksto(e, 'err: ' + eraro)
}

function montruTeksto(e, t) {
  if (t === null || t === undefined) {
    e.textContent = ''
    e.hidden = true
  } else {
    e.textContent = t
  }
}

// por debugado
let EO = null

const eo = (function() {
  let obj = null
  let dilo = null

  function dividilon() {
    if (!dilo) {
      dilo = new Dividulo(obj.radikoj)
    }
    return dilo
  }

  function komprenuVorton(teksto) {
    return dividilon().komprenuVorton(teksto)
  }

  function viduRadikon(teksto) {
    return dividilon().viduRadikon(teksto)
  }

  function kreuObj(radikoj, fakoj) {
    for (let r of radikoj) {
      for (let f of r.fakoj) {
        if (fakoj.findIndex(e => e.nomo == f) < 0) {
          fakoj.push({
            nomo: f
          })
        }
      }
    }

    fakoj.sort((a, b) => eoCompare(a.nomo, b.nomo))

    return obj = {
      radikoj: radikoj,
      fakoj: fakoj,
      komprenuVorton: komprenuVorton,
      viduRadikon: viduRadikon,
    }
  }

  function get(fonto) {
    if (!obj) {
      let fr = fetch(fonto + '/radikoj.json').then(rez => rez.json())
      let ff = fetch(fonto + '/fakoj.json').then(rez => rez.json())
      obj = Promise.all([fr, ff]).then(([r, f]) => kreuObj(r, f))
    }
    obj.then(e => { EO = e; })
    return obj
  }

  return get
})();
