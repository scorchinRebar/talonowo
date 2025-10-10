function openSite(nav) {

  let currentNav = nav.id;

    let slider = document.getElementById('slider');
    console.log(nav.id);

    switch (nav.id) {
        case 'nav1':
                fetch ('zasady.html')
                .then(response => response.text())
                .then(data => {
                  document.getElementById('slider').innerHTML = data;

                    slider.style.transitionDuration = '0.5s';
                    slider.style.transform = 'translateY(18%)'

                    slider.addEventListener('transitionend', () => {
                      slider.style.transitionDuration = '0s';
                      slider.style.transform = 'translateY(-101%)';
                      document.getElementById('mainContent').innerHTML = data;
                      document.getElementById('slider').innerHTML = '';
                    });
                    
                });
            break;

        case 'nav2':
            // window.location.href = '';
            break;

        case 'nav3':
            fetch ('kalkulator.html')
                .then(response => response.text())
                .then(data => {
                  document.getElementById('slider').innerHTML = data;

                    slider.style.transitionDuration = '0.5s';
                    slider.style.transform = 'translateY(18%)'

                    slider.addEventListener('transitionend', () => {
                      slider.style.transitionDuration = '0s';
                      slider.style.transform = 'translateY(-101%)';
                      document.getElementById('mainContent').innerHTML = data;
                      document.getElementById('slider').innerHTML = '';
                    });
                    
                });
            break;

        case 'nav4':
            // window.location.href = '';
            break;

        case 'nav5':
            fetch ('autorzy.html')
                .then(response => response.text())
                .then(data => {
                  document.getElementById('slider').innerHTML = data;

                    slider.style.transitionDuration = '0.5s';
                    slider.style.transform = 'translateY(18%)'

                    slider.addEventListener('transitionend', () => {
                      slider.style.transitionDuration = '0s';
                      slider.style.transform = 'translateY(-101%)';
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