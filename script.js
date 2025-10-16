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

          window.fanfare = window.fanfare.currentTime = 0;
          window.fanfare = window.fanfare.pause();

          window.reeling = window.reeling.currentTime = 0;
          window.reeling = window.reeling.pause();

          window.Bubbles = window.Bubbles.currentTime = 0;
          window.Bubbles = window.Bubbles.pause();
        });

      let scripts = document.body.querySelectorAll('script.dynamic-script');
      scripts.forEach(script => script.remove());

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
        // window.location.href = '';
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
                  document.body.appendChild(script1);

                  script1.onload = function() {
                    console.log('processing.min.js loaded');
                    let script2 = document.createElement('script');
                    script2.src = 'fishGame.js';
                    script2.classList.add('dynamic-script');

                    script2.onload = function() {
                    console.log('fishGame.js loaded');
                    setTimeout(() => {
                      if (window.fishGameProcessingInstance) {
                        console.log('Processing instance already running');
                      } else {
                        console.log('Creating Processing instance...');
                        const canvas = document.getElementById('mycanvas');
                        if (canvas) {
                          window.fishGameProcessingInstance = new Processing(canvas, programCode);
                          console.log("ProcessingJS instance created:", window.fishGameProcessingInstance);
                        } else {
                         console.warn("Nie znaleziono <canvas id='mycanvas'>! Instancja gry nie została utworzona.");
                        }
                      }
                    }, 500);
                  };

                    document.body.appendChild(script2);
                  };

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
    const poleWyniku = document.getElementById("wynik");

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
      poleWyniku.textContent = "Sorry, chyba zapomiałeś zasad wymian walut. Idz se przypomnij";
      return;
    }

    poleWyniku.textContent = `${ilosc} ${walutaZ} = ${wynik} ${walutaNa}`;
}

