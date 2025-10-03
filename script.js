function openSite(nav) {
    console.log(nav.id);

    switch (nav.id) {
        case 'nav1':
            window.location.href = 'index.html';
            break;
        case 'nav2':
            // window.location.href = '';
            break;
        case 'nav3':
            window.location.href = 'kalkulator.html';
            break;
        case 'nav4':
            // window.location.href = '';
            break;
        case 'nav5':
            // window.location.href = ''
            break;
        
        default:
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