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
  while (e.firstChild) {
    e.removeChild(e.firstChild)
  }
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

let _eo = null;

const eo = (function() {
  let eo = null
  let dulo = null

  function komprenuVorton(teksto) {
    if (!dulo) {
      dulo = new Dividulo(eo.radikoj)
    }
    return dulo.komprenuVorton(teksto)
  }

  function kreuObj(radikoj, fakoj) {
    return eo = {
      radikoj: radikoj,
      r2: null,
      fakoj: fakoj,
      komprenuVorton: komprenuVorton,
      thing: function() {
        console.log('thing')
      }
    }
  }

  function get(fonto) {
    if (!eo) {
      let fr = fetch(fonto + '/radikoj.json').then(rez => rez.json())
      let ff = fetch(fonto + '/fakoj.json').then(rez => rez.json())
      eo = Promise.all([fr, ff]).then(([r, f]) => kreuObj(r, f))
    }
    eo.then(e => { _eo = e; })
    return eo
  }

  return get
})();
