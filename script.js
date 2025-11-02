let currentNav = 'nav1';

function openSite(nav) {

  if (currentNav === nav.id) {
    return;
  }

  //jeśli wychodzimy z strony ryby.html, zatrzymujemy instancję gry
  if (currentNav !== nav.id) {
    if (window.fishGameProcessingInstance) {
      console.log('fishGameProcessingInstance at loadIndex:', window.fishGameProcessingInstance);

      // zatrzymanie Processing (przerwanie animacji)
      window.fishGameProcessingInstance.exit();
      window.fishGameProcessingInstance = null;

      // zatrzymanie audio
      requestAnimationFrame(function() {
          window.dayMusic.currentTime = 0;
          window.dayMusic.pause();

          window.nightMusic.currentTime = 0;
          window.nightMusic.pause();

          window.fanfare.currentTime = 0;
          window.fanfare.pause();

          window.reeling.currentTime = 0;
          window.reeling.pause();

          window.Bubbles.currentTime = 0;
          window.Bubbles.pause();
        });

      let scripts = document.body.querySelectorAll('script.dynamic-script');
      scripts.forEach(script => script.remove());

      delete window.canvas;

      console.log('Stara instancja gry została zatrzymana.');
    }
  }

  let slider = document.getElementById('slider');
  console.log(nav.id);

  switch (nav.id) {
    case 'nav1':
      currentNav = 'nav1'
      slider.style.clipPath = 'inset(0% 73% 90% 20%)'
        fetch ('zasady.html')
          .then(response => response.text())
          .then(data => {
            document.getElementById('slider').innerHTML = data;

            slider.style.transitionDuration = '1s';
            slider.style.transform = 'translateY(17.6%)'
            slider.style.clipPath = 'inset(0% 0% 0% 0%)'

            slider.addEventListener('transitionend', () => {
              slider.style.transitionDuration = '0s';
              slider.style.transform = 'translateY(-30%)';
              slider.style.clipPath = 'inset(0% 73% 90% 20%)' //to mozna chyba wywalić
              document.getElementById('mainContent').innerHTML = data;
              document.getElementById('slider').innerHTML = '';
            });
        });
        break;

    case 'nav2':
      currentNav = 'nav2'
      slider.style.clipPath = 'inset(0% 60% 90% 33%)'
        fetch ('wykres.html')
          .then(response => response.text())
          .then(data => {
            document.getElementById('slider').innerHTML = data;

            slider.style.transitionDuration = '1s';
            slider.style.transform = 'translateY(17.6%)'
            slider.style.clipPath = 'inset(0% 0% 0% 0%)'

            slider.addEventListener('transitionend', () => {
              slider.style.transitionDuration = '0s';
              slider.style.transform = 'translateY(-30%)';
              slider.style.clipPath = 'inset(0% 60% 90% 33%)' //to mozna chyba wywalić
              document.getElementById('mainContent').innerHTML = data;
              document.getElementById('slider').innerHTML = '';
              chart();
            });
        });
        break;

    case 'nav3':
      currentNav = 'nav3'
      slider.style.clipPath = 'inset(0% 46% 90% 46%)'
        fetch ('kalkulator.html')
          .then(response => response.text())
          .then(data => {
            document.getElementById('slider').innerHTML = data;

            slider.style.transitionDuration = '1s';
            slider.style.transform = 'translateY(17.6%)'
            slider.style.clipPath = 'inset(0% 0% 0% 0%)'

            slider.addEventListener('transitionend', () => {
              slider.style.transitionDuration = '0s';
              slider.style.transform = 'translateY(-30%)';
              slider.style.clipPath = 'inset(0% 73% 90% 20%)'
              document.getElementById('mainContent').innerHTML = data;
              document.getElementById('slider').innerHTML = '';

              let buttons = document.querySelectorAll('.calcButtons');
              buttons.forEach(button => {
                button.addEventListener('click', function() {
                  buttonClick(this);
                });
              });

              let buttonsTax = document.querySelectorAll('.calcButtonsTax');
              buttonsTax.forEach(buttonTax => {
                buttonTax.addEventListener('click', function() {
                  buttonTaxClick(this);
                });
              });
            });
        });
        break;

    case 'nav4':
      currentNav = 'nav4'
      slider.style.clipPath = 'inset(0% 33% 90% 60%)'
        fetch ('ryby.html')
          .then(response => response.text())
          .then(data => {
            document.getElementById('slider').innerHTML = data;

            slider.style.transitionDuration = '1s';
            slider.style.transform = 'translateY(17.6%)'
            slider.style.clipPath = 'inset(0% 0% 0% 0%)'

            setTimeout(() => {
              slider.style.transitionDuration = '0s';
              slider.style.transform = 'translateY(-30%)';
              slider.style.clipPath = 'inset(0% 33% 90% 60%)'
              document.getElementById('mainContent').innerHTML = data;
              document.getElementById('slider').innerHTML = '';

              //Fetch nie wczytuje skryptów JS, dlatego trzeba je dodać osobno
              if (!window.fishGameProcessingInstance) {
                requestAnimationFrame(function() {
                  let script1 = document.createElement('script');
                  script1.src = 'data/processing.min.js';
                  script1.classList.add('dynamic-script');

                  script1.onload = function() {
                    let script2 = document.createElement('script');
                    script2.src = 'fishGame.js';
                    script2.classList.add('dynamic-script');
                    document.body.appendChild(script2);
                  };

                  document.body.appendChild(script1);
                });
              }
            }, 1000);
        });
        break;

    case 'nav5':
      currentNav = 'nav5'
      slider.style.clipPath = 'inset(0% 20% 90% 73%)'
        fetch ('autorzy.html')
          .then(response => response.text())
          .then(data => {
            document.getElementById('slider').innerHTML = data;

            slider.style.transitionDuration = '1s';
            slider.style.transform = 'translateY(17.6%)'
            slider.style.clipPath = 'inset(0% 0% 0% 0%)'

            slider.addEventListener('transitionend', () => {
              slider.style.transitionDuration = '0s';
              slider.style.transform = 'translateY(-30%)';
              slider.style.clipPath = 'inset(0% 73% 90% 20%)'
              document.getElementById('mainContent').innerHTML = data;
              document.getElementById('slider').innerHTML = '';
            });
        });
        break;
        
    default:
        console.log('przekazano zły nav.id');
        break;
  }
}

function przelicz() {
  const ilosc = parseInt(document.getElementById("ilosc").value);
  const walutaZ = document.getElementById("z").value;
  const walutaNa = document.getElementById("na").value;
  const poleWyniku = document.getElementById("ilosc");
  poleWyniku.style.fontSize = '13px';
  
  let wynik;

  if (walutaZ === "taloniasz" && walutaNa === "talon") {
    wynik = ilosc * 2; 
  } else if (walutaZ === "talonior" && walutaNa === "taloniasz") {
    wynik = ilosc * 2; 
  } else if (walutaZ === "talonior" && walutaNa === "talon") {
    wynik = ilosc * 4; 
  } else if (walutaZ === walutaNa) {
    wynik = ilosc; 
  } else {
    poleWyniku.value = ''
    poleWyniku.placeholder = "Sorry, chyba zapomiałeś zasad wymian walut. Idz se przypomnij";
    return;
  }
  poleWyniku.value = ''
  poleWyniku.placeholder = `${ilosc} ${walutaZ} = ${wynik} ${walutaNa}`;
}

function przeliczPodatek() {
  const ilosc = parseFloat(document.getElementById("iloscPodatek").value);
  const walutaZ = document.getElementById("zPodatek").value;
  const walutaNa = document.getElementById("naPodatek").value;
  const poleWyniku = document.getElementById("iloscPodatek");
  poleWyniku.style.fontSize = '13px';

  if (!ilosc || ilosc <= 0) {
    poleWyniku.textContent = "dawaj kase a nie";
    return;
  }

  let wynik;
  let podatekProcent;

  if (walutaZ === "taloniasz" && walutaNa === "talon") {
    wynik = ilosc * 2;
    podatekProcent = 0.10; // 10%
  } else if (walutaZ === "talonior" && walutaNa === "taloniasz") {
    wynik = ilosc * 2;
    podatekProcent = 0.25; // 25%
  } else if (walutaZ === "talonior" && walutaNa === "talon") {
    wynik = ilosc * 4;
    podatekProcent = 0.50; // 50%
  } else if (walutaZ === walutaNa) {
    wynik = ilosc;
    podatekProcent = 0; // brak podatku
  } else {
    poleWyniku.value = ''
    poleWyniku.placeholder = "przeczytaj regulamin.";
    return;
  }

  const podatek = wynik * podatekProcent;
  const wynikPoPodatku = wynik - podatek;

  const zaokraglonyWynik = wynikPoPodatku.toFixed(2);
  const zaokraglonyPodatek = podatek.toFixed(2);
  const procent = podatekProcent * 100;

  poleWyniku.value = ''
  poleWyniku.placeholder = `${ilosc} ${walutaZ} = ${zaokraglonyWynik} ${walutaNa} (potrącono ${procent}% podatku - ${zaokraglonyPodatek} ${walutaNa})`;
}


function buttonClick(button) {
  let buttonContent = button.textContent;
  const poleWyniku = document.getElementById("ilosc");
  poleWyniku.style.fontSize = '35px';

  poleWyniku.value += buttonContent;
}

function buttonTaxClick(buttonTax) {
  let buttonTaxContent = buttonTax.textContent;
  const poleWyniku = document.getElementById("iloscPodatek");
  poleWyniku.style.fontSize = '35px';

  poleWyniku.value += buttonTaxContent;
}

function clearDisplay(buttonClear) {
  buttonClear.parentElement.firstElementChild.value = ''; //cofamy sie do rodzica (calculatorWrapper) po czym wybieramy pierwsze dziecko czyli display
  buttonClear.parentElement.firstElementChild.fontSize = '35px';
  buttonClear.parentElement.firstElementChild.placeholder = 'Ilość...';
}


// WYKRES GIEŁDA

function chart() {
  const ctx = document.getElementById('wykres').getContext('2d');

  const dane = {
    labels: [],
    datasets: [{
      label: 'Kurs talona',
      data: [],
      borderColor: '#FFA500', 
      borderWidth: 2,
      tension: 0.3,
      fill: false,
      pointRadius: 0 
    }]
  };

  const opcje = {
    responsive: true,
    scales: {
      x: {
        ticks: { color: '#fbca41' }, 
        grid: { color: '#333' }       
      },
      y: {
        ticks: { color: '#fbca41' }, 
        grid: { color: '#333' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#f0f0f0' }
      }
    }
  };

  const wykres = new Chart(ctx, {
    type: 'line',
    data: dane,
    options: opcje
  });

  let aktualnyKurs = 100;

  function dodajNowyPunkt() {
    const czas = new Date().toLocaleTimeString('pl-PL', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const zmiana = (Math.random() - 0.5) * 10; 
    aktualnyKurs = Math.max(aktualnyKurs + zmiana, 1);

    dane.labels.push(czas);
    dane.datasets[0].data.push(aktualnyKurs);
      
    wykres.update();
    
    if (dane.labels.length > 20) {
      dane.labels.splice(0, 1);
      dane.datasets[0].data.splice(0, 1);
    }
  }

  setInterval(dodajNowyPunkt, 2000);
}

