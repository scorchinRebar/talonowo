 console.log('Processing global?', typeof Processing);
 //WŁASNOŚĆ PATRYKA P. AKA majomajo112 ALL RIGHTS RESERVED
 // Funkcja programCode zawiera kod programu napisanego w języku Processing
var programCode = function(p) {
    // Ustawienie rozmiaru płótna na 400x400 pikseli
    p.size(400, 400);
    // Ustawienie liczby klatek na sekundę (60 FPS)
    p.frameRate(60);
    // W tym miejscu możesz wkleić kod napisany w języku Processing z Khan Academy:
console.log("FishGame loaded — Processing in window?", typeof Processing);
    /* Lista zmian/dodatków względem pierwszej wersji gry:
        - pobranie biblioteki processingJS w celu obsługi gry offline ✔
        - obniżenie poziomu wody i ludzika w celu większego miejsca na krajobraz i niebo ✔
        - krajobraz (p.beginShape i p.vertex) z drzewami/krzakami i chmurami ✔
        - przegrana minigierki gdy zielony pasek spadnie do zera ✔
        - Cykl dnia i nocy ✔
        - płynne przejście między dniem i nocą ✔
        - ruch żyłki z przyspieszeniem za pomocą p.PVector ✔
        - bardziej "losowe" i dynamiczne poruszanie się ryb za pomocą p.PVector ✔
        - obracanie się ryb w stronę w którą płyną ✔
        - fale na wodzie, za pomocą fal i prędkości kątowej ✔
        - nocne ryby ✔
        - system cząstęk (zielone cząsteczki podczas miniGame // bąbelki wodne // plusk wody podczas zanurzania haczyka) ✔
        - muzyka, efekty dźwiękowe ✔
        - inne drobne zmiany ✔
    */

//muzyka i efekty dźwiękowe
window.dayMusic = window.dayMusic || new Audio('data/dayMusic.mp3');
window.nightMusic = window.nightMusic || new Audio('data/nightMusic.mp3');
window.fanfare = window.fanfare || new Audio('data/fanfare.mp3');
window.reeling = window.reeling || new Audio('data/reeling.mp3');
window.catchFail = window.catchFail || new Audio('data/catchFail.mp3');
window.catchSuccess = window.catchSuccess || new Audio('data/catchSuccess.mp3');
window.hooked = window.hooked || new Audio('data/hooked.mp3');
window.Bubbles = window.Bubbles || new Audio('data/bubbles.mp3')

window.reeling.volume = 0.2;

//konstruktor wędki
var Rod = function() {
    this.RodPos = new p.PVector(-60, 140);    //własności wędziska    (new p.PVector(x, y) - jedna zmienna przechowuje dwie współrzędne (punkt))
    this.RodLengthWidth = new p.PVector(60, 5);

    this.LinePos = new p.PVector(105, -45);   //własności żyłki
    this.LineLengthWidth = new p.PVector(40, 1);
    this.LineSpeed = new p.PVector(0, 0);

    this.hookPos = new p.PVector(161, 100);   //własności haczyka
    this.hookSpeed = new p.PVector(0, 0);

    this.lineAcceleration = new p.PVector(0.04, 0);   //przyspieszenie żyłki i haczyka
    this.hookAcceleration = new p.PVector(0, 0.04);

    this.fishCaught = 0;    //ilość złapanych ryb

    this.lastCollision = -1001; //zmienna służąca do zaimplementowania przerwy czasowej między wywołaniem waterParticle
};

//funkcja rysująca wędkę
Rod.prototype.draw = function() {

//wędzisko i żyłka
    p.pushMatrix();
        p.fill(37, 2, 70);
        p.translate(200, 200);
        p.rotate(p.radians(140));
        p.rect(this.RodPos.x, this.RodPos.y, this.RodLengthWidth.x, this.RodLengthWidth.y);  //wędzisko
        p.fill(255, 255, 255);
        p.rotate(p.radians(130));
        p.rect(this.LinePos.x, this.LinePos.y, this.LineLengthWidth.x, this.LineLengthWidth.y);  //żyłka
    p.popMatrix();

//haczyk
    p.pushMatrix();
        p.rotate(p.radians(90));
        p.fill(49, 49, 49);
        p.rect(this.LineLengthWidth.x + 54, -158, 8, 2);

        p.rotate(p.radians(90));
        p.fill(49, 49, 49);
        p.rect(-162, -63 - this.LineLengthWidth.x, 5, 2);

        p.rotate(p.radians(90));
        p.fill(49, 49, 49);
        p.rect(-62 - this.LineLengthWidth.x, 160, 5, 2);
    p.popMatrix();

    p.fill(255, 255, 255);
    p.ellipse(this.hookPos.x, this.hookPos.y, 3, 3);  //biały punkt na haczyku, ułatwiający sprawdzenie warunku z Fish.prototype.isHooked

//ograniczenia dot. wielkości zmiennych odpowiedzialnych za ruch żyłki i haczyka
    this.LinePos.x = p.constrain(this.LinePos.x, -190, 105);
    this.LineLengthWidth.x = p.constrain(this.LineLengthWidth.x, 40, 335);
    this.hookPos.y = p.constrain(this.hookPos.y, 100, 395);
};

//funkcja "opuszczająca" żyłkę i haczyk
Rod.prototype.lineDown = function() {
    this.LineSpeed.add(this.lineAcceleration);  //dodanie przyspieszenia do prędkości - płynny ruch (mimo ruchu w pionie zmieniamy współrzędną x z powodu obrotu płótna w metodzie draw wędki)
    this.hookSpeed.add(this.hookAcceleration);

    //zmiana pozycji żyłki i haczyka
    this.LinePos.sub(this.LineSpeed);
    this.LineLengthWidth.add(this.LineSpeed);
    this.hookPos.add(this.hookSpeed);

    this.LineSpeed.limit(2);    //ograniczenie prędkości
    this.hookSpeed.limit(2);

    if(this.hookPos.y > 395) {
        this.LineSpeed.mult(0);  //wyzerowanie prędkości, zatrzymanie żyłki na dolnej granicy płótna
        this.hookSpeed.mult(0);
    }

    if(this.LineSpeed.x > 0) {
        reeling.play();  //dźwięk żyłki
    }
};

//funkcja "podnosząca" żyłkę i haczyk
Rod.prototype.lineUp = function() {
    this.LineSpeed.sub(this.lineAcceleration);  //odejmuje przyspieszenie, aby prędkość się wyzerowała, a następnie zawróciła
    this.hookSpeed.sub(this.hookAcceleration);
    
    //zmiana pozycji żyłki i haczyka
    this.LinePos.sub(this.LineSpeed);
    this.LineLengthWidth.add(this.LineSpeed);
    this.hookPos.add(this.hookSpeed);

    this.LineSpeed.limit(2);    //ograniczenie prędkości
    this.hookSpeed.limit(2);

    if(this.hookPos.y < 100) {
        this.LineSpeed.mult(0);  //wyzerowanie prędkości, zatrzymanie żyłki na górze
        this.hookSpeed.mult(0);
    }

    if(this.LineSpeed.x < 0) {
        reeling.play();  //dźwięk żyłki
    }
};

//funkcja sprawdzająca kolizję haczyka z powierzchnią wody
Rod.prototype.ifCollision = function(y) {
    //pozycja y haczyka i wody są zaokrąglone w celu umożliwienia wykrycia kolizji
    //kolizja zachodzi max. raz na sekundę
    if (p.round(this.hookPos.y) === p.round(y) && p.millis() - this.lastCollision > 1000) {
        //console.log('collision');
        for (var i = 0; i < 15; i++) {
            waterParticles.push(new waterParticle(this.hookPos.y)); //dodanie do tablicy 15 cząsteczek wody
        }
        this.lastCollision = p.millis(); //reset czasu od ostatniej kolizji
    }
};


//konstruktor cząstek przy minigierce
var miniGameParticle = function() {
    this.position = new p.PVector(greenRect + 40, p.random(300, 350));
    this.size = p.random(6, 12);
    this.velocity = new p.PVector(p.random(-1, 0), p.random(-1, 0));    //prędkość - cząsteczki początkowo "wyrzuca" w lewo i lekko w górę
    this.acceleration = new p.PVector(0, 0.03);   //przyspieszenie ściąga cząsteczki w dół

    this.alpha = 255; //przezroczystość cząsteczek

    //różne odcienie zieleni
    if (p.random(1) > 0.66) {
        this.color = p.color(0, 180, 0);       
    } else if (p.random(1) > 0.33) {
        this.color = p.color(0, 200, 0);
    } else {
        this.color = p.color(0, 220, 0);
    }
}

//funkcja rysująca cząsteczki
miniGameParticle.prototype.draw = function() {
    p.fill(this.color, this.alpha);
    p.ellipse(this.position.x, this.position.y, this.size, this.size);
};

//funkcja aktualizująca pozycję i kolor cząsteczek
miniGameParticle.prototype.update = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    this.alpha -= 2.5;
};


//cząsteczki imitujące bąbelki wodne
var bubblesParticle = function() {
    this.position = new p.PVector(p.random(10, 390), p.random(140, 370));
    this.size = p.random(4, 8);
    this.velocity = new p.PVector(p.random(0, 0), p.random(-0.2, 0));
    
    this.acceleration = new p.PVector(0, -0.005);
};

//funkcja rysująca cząsteczki
bubblesParticle.prototype.draw = function() {
    p.ellipse(this.position.x, this.position.y, this.size, this.size);
};

//funkcja aktualizująca pozycję i rozmiar cząsteczek
bubblesParticle.prototype.update = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.velocity.limit(0.2);

    this.size += 0.004; //bąbelki wodne są większe im bliżej znajdują się powierzchni (mniejsze ciśnienie)
};


//cząsteczki przy kontakcie haczyka z powierzchnią wody
var waterParticle = function(y) {
    this.position = new p.PVector(p.random(156, 160), y);   //przekazuje argument y z pętli rysującej fale na wodzie w funkcji draw
    this.size = p.random(1, 4);
    this.velocity = new p.PVector(p.random(-0.3, 0.3), p.random(-2, -0.5));   //cząsteczki są "wyrzucane" do góry
    this.acceleration = new p.PVector(0, 0.04);   //przyspieszenie ściąga cząsteczki w dół
};

//funkcja rysująca cząsteczki
waterParticle.prototype.draw = function() {
    p.ellipse(this.position.x, this.position.y, this.size, this.size);
};

//funkcja aktualizująca pozycję i rozmiar cząsteczek
waterParticle.prototype.update = function() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(1);
};


//konstruktor ryby
var Fish = function() {
    this.position = new p.PVector(p.random(40, 350), p.random(170, 380));
    this.velocity = new p.PVector(0, 0);
    this.size = p.random(0.5, 2); //ryby są różnej wielkości
    this.acceleration = new p.PVector(0.02 * this.size, 0.01 * this.size); // przyspieszenie zależne od wielkości ryby

    this.swimmingStates = ['slowSwim', 'mediumSwim', 'fastSwim']; //tablica z różnymi stanami prędkości ryb
    this.randomSwim = 'fastSwim'; //początkowy stan prędkości ryby

    this.eyeX = 17;
    this.bodyColor = p.color(p.random(100, 255), p.random(50, 150), p.random(50, 150)); //ryba posiada losowe ubarwienie
    this.finColor = p.color(p.random(50, 150), p.random(150, 255), p.random(100, 255));
    this.direction = new p.PVector(p.random(1) < 0.5 ? -1 : 1, p.random(1) < 0.5 ? -1 : 1); //warunek wybiera początkowy kierunek ruchu ryby: 1 - prawo/góra lub -1 - lewo/dół

    this.fishHooked = false;    //flaga używana do sprawdzenia czy ryba jest zahaczona
    this.fishOnTop = false;     //flaga używana do sprawdzenia czy ryba jest na górze (czy jest złapana)
    this.fishAway = false;      //flaga używana do sprawdzenia czy na płótnie jest odpowiedni rodzaj ryby
    
    this.hookedTime = -1; //własność używana do zapisania czasu zahaczenia ryby, początkowo -1, ponieważ żadna ryba nie jest zahaczona
};

//funkcja rysująca ryby
Fish.prototype.draw = function() {
    this.angle = this.velocity.heading();  //oblicza kąt obrotu wektora prędkości względem osi X

    p.pushMatrix();
    p.translate(this.position.x, this.position.y);
    p.rotate(this.angle);  //obrót ryby w kierunku, w którym płynie
    p.scale(this.size, this.size * this.direction.x);  //Jeśli ryba płynie w lewo, jej skala w osi Y musi zostać pomnożona przez -1 aby ryba nie płynęła do góry (płetwami?) (skala ryby jest na minusie - obraca się poprzez lustrzane odbicie)

    //tułów
    p.stroke(0, 0, 0);
    p.fill(this.bodyColor);
    p.bezier(0, 0.3, 15, -7.5, 20, -7.5, 20, 0.3);
    p.bezier(0, -0.3, 15, 10, 20, 7.5, 20, -0.3);

    //oko
    p.fill(0, 0, 0);
    p.ellipse(this.eyeX, -1.5, 2, 2);

    //ogon
    p.fill(this.finColor);
    p.bezier(-5, -6, 2, 0, 2, 0, -5, 4);
    p.noStroke();
    p.popMatrix(); 
};

//funkcja odpowiedzialna za ruch ryb
Fish.prototype.swim = function() {
    //ryba nie porusza się jeśli została złapana
    if (this.fishOnTop) {
        return;
    }

    if (p.random(10) <= 0.01) {
        this.randomSwim = this.swimmingStates[p.floor(p.random(3))]; //wybiera losowy stan (prędkość ruchu ryby) z tablicy swimmingStates
    }

    //mała szansa na losową zmianę kierunku poruszania się ryby
    if (p.random(10) <= 0.03) {
        this.direction.y *= -1;
    }

    if (p.random(10) <= 0.02) {
        this.direction.x *= -1;
    }

    //prędkość ryby dodatnia lub ujemna (płynie lewo lub w prawo) w zależności od kierunku
    if(this.direction.x === 1){
        this.velocity.x += this.acceleration.x;
    } else if (this.direction.x === -1){
        this.velocity.x -= this.acceleration.x;
    } 

    //to samo z poruszaniem się w pionie
    if (this.direction.y === 1) {
        this.velocity.y += this.acceleration.y;
    } else if (this.direction.y === -1) {
        this.velocity.y -= this.acceleration.y;
    }

    var velocityLimit = p.map(this.size, 0.5, 2, 1.5, 0.5); //prędkość ryby uzależniona od wielkości ryby

    // Ograniczenie prędkości ryby w zależności od obecnego stanu prędkości poruszania się
    if (this.randomSwim === 'fastSwim') {
        this.velocity.limit(velocityLimit);
    } else if (this.randomSwim === 'mediumSwim') {
        this.velocity.limit(velocityLimit / 2);
    } else if (this.randomSwim === 'slowSwim') {
        this.velocity.limit(velocityLimit / 3);
    }

    this.position.add(this.velocity);

    //Aby ryba nie wypłynęła poza płótno, zmienia się jej kierunek ruchu
    if (this.position.x > 400 - 20 * this.size) {
        this.direction.x = -1;
        this.velocity.mult(-1);
    }
    if (this.position.y > 400 - 15 * this.size) {
        this.direction.y = -1;
    }
    if (this.position.x < 0 + 20 * this.size) {
        this.direction.x = 1;
        this.velocity.mult(-1);
    }
    if (this.position.y < 150 + 10 * this.size) {
        this.direction.y = 1;
    }

    //ograniczenia dot. położenia ryby
    if (!this.fishOnTop) {
        this.position.y = p.constrain(this.position.y, 150, 390);
        //this.position.x = p.constrain(this.position.x, 0, 400);
    }
};

//funkcja odpowiedzialna za ucieczkę ryb przed nocą
Fish.prototype.swimAway = function() {
    if (this.fishOnTop) {
        return;
    }
    this.fishAway = true;

    this.direction.set(1, 0);
    this.velocity.set(1, 0);
    this.position.add(this.velocity);

    this.position.x = p.constrain(this.position.x, 0, 500);

    //ryby odpływają w prawo aż do wypłynięcia poza płótno
    if(this.position.x > 500) {
        this.velocity.set(0, 0);
    }
};

//funkcja odpowiedzialna za powrót ryb przed dniem
Fish.prototype.swimBack = function() {
    if(!this.fishAway || this.fishOnTop){
        return;
    }

    if (!this.targetX) {
        this.targetX = p.random(60, 350); //miejsce do którego mają wrócić ryby
    }

    this.direction.set(-1, 0);
    this.velocity.set(-1, 0);
    this.position.add(this.velocity);

    //po dotarciu do miejsca docelowego ryby znów zaczynają pływać wg metody swim
    if(this.position.x < this.targetX){
        this.fishAway = false;
        this.direction.set(p.random(1) < 0.5 ? -1 : 1, p.random(1) < 0.5 ? -1 : 1);
        this.velocity = new p.PVector(0, 0);
        this.randomSwim = this.swimmingStates[p.floor(p.random(3))];
        this.targetX = null;
    }
};

//funkcja odpowiedzialna za sprawdzenie, czy ryba jest zahaczona - przekazujemy argumenty rod i index
Fish.prototype.isHooked = function(rod, index) {

    var eyeOffsetX = this.eyeX * this.size; //dokładna pozycja oczu ryby w poziomie
    var eyeOffsetY = -1.5 * this.size; //dokładna pozycja oczu ryby w pionie

    //dokładna pozycja oczu ryby eyeOffsetX i eyeOffsetY przestaje być stała, gdyż poprzez funckję p.rotate() w metodzie draw()
    //zmienia się kąt obrotu płótna, natomiast oko ryby pozostaje na tych samych współrzędnych. Musimy obliczyć pozycję oka po obrocie.
    //wykorzystujemy do tego wzór na obrót punktu o dany kąt: x′ = x⋅cos(θ) − y⋅sin(θ)  oraz  y′ = x⋅sin(θ) + y⋅cos(θ)
    var rotatedEyeX = this.position.x + (eyeOffsetX * p.cos(this.angle) - eyeOffsetY * p.sin(this.angle));    //obliczenie x'
    var rotatedEyeY = this.position.y + (eyeOffsetX * p.sin(this.angle) + eyeOffsetY * p.cos(this.angle));    //obliczenie y'

    //Sprawdzanie, czy haczyk i oko ryby są w odpowiedniej odległości
    if (p.dist(rod.hookPos.x, rod.hookPos.y, rotatedEyeX, rotatedEyeY) < 5) {   //punktem zahaczenia haczyka jest oko ryby
        this.hooked(rod, index);    //Wywołanie funkcji, jeśli haczyk jest w pobliżu
    }
};

//funkcja zahaczenia ryby
Fish.prototype.hooked = function(rod, index) {

    if (!this.fishHooked && hookedFishIndex === -1) {
        hooked.play();  //dźwięk zahaczenia ryby

        /*do debugowania
        if (this.direction == 1) {
        console.log(`!!fish ${index} hooked!! Hook: ${rod.hookPos.x} ${rod.hookPos.y}, FishEye: ${this.position.x + rotatedEyeX}, ${this.position.y}`);
        }
    
        if (this.direction == -1) {
        console.log(`!!fish ${index} hooked!! Hook: ${rod.hookPos.x} ${rod.hookPos.y}, FishEye: ${this.position.x - rotatedEyeY}, ${this.position.y}`);
        }*/

        this.hookedTime = p.millis(); //jeśli ryba się zahaczy, zapisuje czas zahaczenia ryby
            //console.log(this.hookedTime);
        this.fishHooked = true;
        gamePaused = true;      //pauza gry
    }
    hookedFishIndex = index;    //index zahaczonej ryby, przekazany z pętli w funkcji draw()
};

//funkcja odpowiedzialna za minigrę podczas zahaczenia ryby
Fish.prototype.miniGame = function(rod, index) {
    hookedFishIndex = index;

    if (p.millis() - this.hookedTime > 3000) {  //po upływie określonego czasu od zahaczenia ryby, wywołuje grę

        p.fill(0, 0, 0);
        p.textSize(38);
        p.text("Klikaj SPACJĘ!", 70, 290);

        p.fill(255, 255, 255);
        p.rect(50, 300, 300, 50);//biały pasek

        p.fill(0, 255, 0);
        p.rect(50, 300, greenRect, 50);   //zielony pasek
        greenRect = p.constrain(greenRect, 0, 300);   //zielony pasek nie może wychodzić poza pasek biały

        if (p.frameCount % 10 === 0) {
            greenRect -= 2.3 * this.size; //im większa ryba tym ciężej ją wyłowić - pasek szybciej idzie w lewo
        }

        if (p.keyPressed && p.keyCode === 32) {
            greenRect += 10;
            p.keyCode = 0; // Resetowanie, aby pasek się nie zwiększał ciągle
            for (var i = 0; i < 5; i++) {
                miniGameParticles.push(new miniGameParticle()); //cząsteczki z każdym kliknięciem
            }
        }
    } else {
        p.fill(0, 0, 0);
        p.textSize(28);
        p.text('Ryba zahaczona, przygotuj się', 10, 160); //przed upływem określonego czasu pojawia się napis
    }

    //jeśli zielony pasek dotrze do końca, ryba zostaje złapana, a gra zostaje wznowiona
    if (greenRect >= 300) {
        catchSuccess.play(); //dźwięk złapania ryby
        rod.fishCaught++;
        this.fishHooked = false;
        this.fishOnTop = true;
        gamePaused = false;
        hookedFishIndex = -1;
        greenRect = 150;
        miniGameParticles = []; //zerowanie ilości cząsteczek
        this.position = new p.PVector(p.random(20, 70), p.random(110, 120)); //złapana ryba zostaje przeniesiona na pomost
        this.direction = new p.PVector(p.random(1) < 0.5 ? -1 : 1, -1);
        this.velocity = new p.PVector(0, 0);
        this.acceleration = new p.PVector(0, 0);

    }

    //jeśli zielony pasek spadnie do zera, ryba nie zostaje złapana, a gra zostaje wznowiona
    if (greenRect <= 0) {
        catchFail.play();    //dźwięk niezłapania ryby
        this.fishHooked = false;
        gamePaused = false;
        hookedFishIndex = -1;
        greenRect = 150;
        miniGameParticles = []; //zerowanie ilości cząsteczek
        if (this.direction.x === 1){
            this.position.x += 20;        //niezłapana ryba płynie dalej w swoim kierunku
        } else {
            this.position.x -= 20;
        }
    }
};

//stworzenie nocnych ryb poprzez odwołanie (call) do ryb dziennych
var NightFish = function() {
    Fish.call(this);

    this.position = new p.PVector(p.random(460, 480), p.random(170, 380)); // ryby nocne na początku gry są poza płótnem

    this.bodyColor = p.color(p.random(20, 100), p.random(10, 80), p.random(10, 80)); //ryby nocne mają ciemniejsze kolory
    this.finColor = p.color(p.random(10, 80), p.random(80, 200), p.random(50, 200));

    this.nightFishAway = false; //flaga używana do sprawdzenia czy na płótnie jest odpowiedni rodzaj ryby
};

NightFish.prototype = Object.create(Fish.prototype); //nocne ryby dziedziczą metody swoich odpowiedników dziennych
NightFish.prototype.constructor = NightFish; //upewnienie, że NightFish poprawnie identyfikuje się jako NightFish, a nie jako Fish. (bądź jakaś inna osoba (tu: ryba) niebinarna)

//funkcja odpowiedzialna za ucieczkę ryb nocnych przed dniem, działa identycznie do metod ryb dziennych
NightFish.prototype.swimAway = function() {
    if (this.fishOnTop) {
        return;
    }
    this.nightFishAway = true;

    this.direction.set(1, 0);
    this.velocity.set(1, 0);
    this.position.add(this.velocity);

    this.position.x = p.constrain(this.position.x, 0, 500);

    if(this.position.x > 500) {
        this.velocity.set(0, 0);
    }
};

//funkcja odpowiedzialna za powrót ryb nocnych przed nocą
NightFish.prototype.swimBack = function() {
    if (!this.nightFishAway || this.fishOnTop) {
        return;
    }

    if (!this.targetX) {
        this.targetX = p.random(60, 350); //miejsce do którego mają wrócić ryby
    }

    this.direction.set(-1, 0);
    this.velocity.set(-1, 0);
    this.position.add(this.velocity);

    if (this.position.x < this.targetX) {
        this.nightFishAway = false;
        this.direction.set(p.random(1) < 0.5 ? -1 : 1, p.random(1) < 0.5 ? -1 : 1);
        this.velocity = new p.PVector(0, 0);
        this.randomSwim = this.swimmingStates[p.floor(p.random(3))];
        this.targetX = null;
    }
};

//funkcja zahaczenia ryby
NightFish.prototype.hooked = function(rod, index) {
    
    if (!this.fishHooked && hookedFishIndex === -1) {
        hooked.play();  //dźwięk zahaczenia ryby

         /*do debugowania
        if (this.direction == 1) {
        console.log(`!!fish ${index} hooked!! Hook: ${rod.hookPos.x} ${rod.hookPos.y}, FishEye: ${this.position.x + rotatedEyeX}, ${this.position.y}`);
        }
    
        if (this.direction == -1) {
        console.log(`!!fish ${index} hooked!! Hook: ${rod.hookPos.x} ${rod.hookPos.y}, FishEye: ${this.position.x - rotatedEyeY}, ${this.position.y}`);
        }*/
    
        this.hookedTime = p.millis(); //jeśli ryba się zahaczy, zapisuje czas zahaczenia ryby
            //console.log(this.hookedTime);
        this.fishHooked = true;
        gamePaused = true;      //pauza gry
    }
    hookedNightFishIndex = index;    //index zahaczonej ryby
};

//funkcja odpowiedzialna za minigrę podczas zahaczenia ryby
NightFish.prototype.miniGame = function(rod, index) {
    hookedNightFishIndex = index;

    if (p.millis() - this.hookedTime > 3000) {  //po upływie określonego czasu od zahaczenia ryby, wywołuje grę

        p.fill(0, 0, 0);
        p.textSize(38);
        p.text("Klikaj SPACJĘ!", 70, 290);
        
        p.fill(255, 255, 255, 150);
        p.rect(50, 300, 300, 50); //biały pasek
    
        p.fill(0, 180, 0);
        p.rect(50, 300, greenRect, 50);   //zielony pasek

        greenRect = p.constrain(greenRect, 0, 300);   //zielony pasek nie może wychodzić poza pasek biały
    
        if (p.frameCount % 10 === 0) {
            greenRect -= 2.3 * this.size; //im większa ryba tym ciężej ją wyłowić - pasek szybciej idzie w lewo
        }

        if (p.keyPressed && p.keyCode === 32) {
            greenRect += 10;
            p.keyCode = 0; // Resetowanie, aby pasek się nie zwiększał ciągle
            for (var i = 0; i < 5; i++) {
                miniGameParticles.push(new miniGameParticle()); //cząsteczki z każdym kliknięciem
            }
        }
    } else {
        p.fill(0, 0, 0);
        p.textSize(28);
        p.text('Ryba zahaczona, przygotuj się', 10, 160); //przed upływem określonego czasu pojawia się napis
    }

    //jeśli zielony pasek dotrze do końca, ryba zostaje złapana, a gra zostaje wznowiona
    if (greenRect >= 300) {
        catchSuccess.play(); //dźwięk złapania ryby
        rod.fishCaught++;
        this.fishHooked = false;
        this.fishOnTop = true;
        gamePaused = false;
        hookedNightFishIndex = -1;
        greenRect = 150;
        miniGameParticles = []; //zerowanie ilości cząsteczek
        this.position = new p.PVector(p.random(20, 70), p.random(110, 120)); //złapana ryba zostaje przeniesiona na pomost
        this.direction = new p.PVector(p.random(1) < 0.5 ? -1 : 1, -1);
        this.velocity = new p.PVector(0, 0);
        this.acceleration = new p.PVector(0, 0);
    }

    //jeśli zielony pasek spadnie do zera, ryba nie zostaje złapana, a gra zostaje wznowiona
    if (greenRect <= 0) {
        catchFail.play();    //dźwięk niezłapania ryby
        this.fishHooked = false;
        gamePaused = false;
        hookedNightFishIndex = -1;
        greenRect = 150;
        miniGameParticles = []; //zerowanie ilości cząsteczek
        if (this.direction.x === 1){
            this.position.x += 20;        //niezłapana ryba płynie dalej w swoim kierunku
        } else {
            this.position.x -= 20;
        }
    }
};

//konstruktor drzewa
var Tree = function() {
    this.x = p.random(0, 385);
    this.y = p.random(80, 115);
    this.treeHeight = p.random(2, 50);
    this.treeWidth = p.random(4, 7);
    this.woodColor = p.color(74, 40, 0);
    this.woodNightColor = p.color(33, 18, 0);
    this.leafColor = p.color(30, 128, 0);
    this.leafNightColor = p.color(17, 54, 0);

    this.leafs = [];    //tablica zawierająca liście od drzewa

    //dodanie współrzędnych 30 liści do tablicy
    for (var i = 0; i < 30; i++) {
        this.leafs.push({x: this.x + p.random(-10, 10), y: this.y - this.treeHeight / 2 + p.random(-10, 10), angle: p.random(-30, 30)});
    }
};

//funkcja rysująca drzewo
Tree.prototype.draw = function() {
    
    p.rectMode(CENTER);
    if (isDay) {
        p.fill(p.lerpColor(this.woodColor, this.woodNightColor, t));
    } else {
        p.fill(p.lerpColor(this.woodNightColor, this.woodColor, t2));
    }
    p.rect(this.x, this.y, this.treeWidth, this.treeHeight);
    p.rectMode(CORNER);

    this.drawLeaf();    //wywołanie funkcji rysującą liście dla każego drzewa
};

//funkcja rysująca liście
Tree.prototype.drawLeaf = function() {

    for (var i = 0; i < this.leafs.length; i++) {
        p.pushMatrix();
        p.translate(this.leafs[i].x, this.leafs[i].y);
        p.rotate(p.radians(this.leafs[i].angle));

        if (isDay) {
            p.fill(p.lerpColor(this.leafColor, this.leafNightColor, t));
        } else {
            p.fill(p.lerpColor(this.leafNightColor, this.leafColor, t2));
        }
        p.ellipse(0, 0, 5, 10);
        p.popMatrix();
    }
};

//tablice przechowujące atrybuty dla gwiazd, drzew, bąbelków, wodorostów, kamieni, ryb oraz cząsteczek
var stars = [];
for (var i = 0; i < 40; i++) {
    stars.push({x: p.random(400), y: p.random(80), size: 2});
}

var trees = [];
for (var i = 0; i < 15; i++) {
    trees.push(new Tree());
}

var bubbles = [];
for (var i = 0; i < 20; i++) {
    bubbles.push(new bubblesParticle());
}

var seaweed = [];
for (var i = 0; i < 15; i++) {
    seaweed.push({x: 200, y: p.random(-200, 200), height: p.random(20, 300), width: p.random(2, 5)});
}

var rocks = [];
for (var i = 0; i < 4; i++) {
    rocks.push({x: p.random(10, 350), y: 385, width:p.random(20, 70), height: p.random(15, 100)});
}

var fish = [];
for (var i = 0; i < 5; i++) {
    fish.push(new Fish());
}

var nightFish = [];
for (var i = 0; i < 5; i++) {
    nightFish.push(new NightFish());
}

var miniGameParticles = [];
var waterParticles = [];

var rod = new Rod(); //instancja obiektu Rod - tworzy wędkę

//wszystkie zmienne używane w grze - flagi, współrzędne, kolory itp.
var isDay = true;
var dayMusicActivated = false;

var gamePaused = false;
var hookedFishIndex = -1; //indeks zahaczonej ryby, -1 oznacza brak
var hookedNightFishIndex = -1;
var greenRect = 150;
var fishNumber = fish.length + nightFish.length;    //łączna liczba ryb

var dayTime = 0; //0-60 - dzień, 60-120 - noc
var daySpeed = 0.0167;  //prędkość słońca na płótnie
var sunX = 438;
var moonX = 420;
var sunSpeed = p.map(daySpeed, 0, 60, 0, 465); //polecenie mapujące zmienną daySpeed z zakresu od 0 do 60 do zakresu od 0 do 465 (użyte aby słońce poruszało się równo z upływem czasu)
var moonSpeed = p.map(daySpeed, 0, 60, 0, 430); //polecenie mapujące zmienną daySpeed z zakresu od 0 do 60 do zakresu od 0 do 430 (użyte aby księżyc poruszało się równo z upływem czasu)
var sunRotate = 0;  //obrót promieni słonecznych wokół słońca
var moonRotate = 0; //obrót księżyca wokół własnej osi

var cloudX, cloudY, cloudX2, cloudY2;

var cloudTimeX = 100;   //zmienne używane do zmiany położenia chmur w czasie
var cloudTimeY = 1;
var cloudTimeX2 = 100;
var cloudTimeY2 = 1;

//zmienne używane do narysowania fali za pomocą prędkości
var waveAngle = 0;
var waveAngleVelocity = 0.45;
var waveAmplitude = 5;
var angle;

//kolory
var skyColor = p.noStroke(100, 212, 253);
var nightSkyColor = p.noStroke(19, 24, 98);
var landscapeColor = p.noStroke(0, 173, 0);
var landscapeNightColor = p.noStroke(0, 77, 0);
var cloudColor = p.noStroke(255, 255, 255, 200);
var cloudNightColor = p.noStroke(35, 36, 59, 200);
var waterColor = p.noStroke(0, 255, 255);
var waterNightColor = p.noStroke(29, 52, 135);
var bridgeColor = p.noStroke(58, 32, 15);
var bridgeNightColor = p.noStroke(31, 16, 6);
var starsColor = p.noStroke(100, 212, 253);
var starsNightColor = p.noStroke(255, 255, 255);
var sandColor = p.noStroke(255, 236, 189);
var sandNightColor = p.noStroke(69, 51, 25);
var seaweedColor = p.noStroke(0, 110, 0);
var seaweedNightColor = p.noStroke(0, 64, 0);
var rockColor = p.noStroke(73, 73, 72);
var rockNightColor = p.noStroke(33, 33, 33);

//zmienne używane do określenia prędkości płynnych przejść między kolorami
var t = 0;
var t2 = 0;

//wschody i zachody trwają po 15 sekund, początkowo 0
var sunset = 0;
var moonset = 0;
window.dayMusicListenerAdded = false;

//funkcja odpowiadająca za dzień
day = function(){
    p.background(p.lerpColor(skyColor, nightSkyColor, t)); //niebo (p.lerpColor płynnie zmienia kolor)
    nightMusic.pause(); //pauza muzyki nocnej

    if (!window.dayMusicListenerAdded) {
        window.addEventListener("click", function() {
            window.dayMusic.play();
            dayMusicActivated = true;
        }, { once: true });
    window.dayMusicListenerAdded = true;
    }

    //rysowanie gwiazd (w dzień nie są widoczne, ukazują się podczas zachodu słońca)
    for(var i = 0; i < stars.length; i++){
        p.fill(p.lerpColor(starsColor, starsNightColor, t));
        p.ellipse(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
    }

    p.pushMatrix();
    p.translate(0, -60);
    p.fill(p.lerpColor(landscapeColor, landscapeNightColor, t));
    p.beginShape();   //krajobraz
    p.vertex(0, 265); p.vertex(0, 131); p.vertex(36, 134); p.vertex(77, 143); p.vertex(132, 157); p.vertex(179, 138); p.vertex(218, 125);
     p.vertex(271, 131); p.vertex(320, 131); p.vertex(348, 145); p.vertex(400, 148); p.vertex(400, 242);
    p.endShape(CLOSE);
    p.popMatrix();

    p.fill(255, 255, 0);
    p.ellipse(sunX, 30, 40, 40); //słońce
    if(!gamePaused) {
        sunX -= sunSpeed;   //słońce przesuwa się w lewo
    }

    //promienie słoneczne
    for (var i = 0; i < 360; i+=30) {    //360 stopni, każdy promień co 30°
        p.pushMatrix();
        p.translate(sunX, 30);
        p.rotate(p.radians(i)); //położenie promieni co 30°
        p.rotate(p.radians(sunRotate)); //dynamiczny obrót promieni wokół słońca
        p.rect(20, 0, 20, 5);
        p.popMatrix();
    }
    if(!gamePaused) {
        sunRotate -= 0.15; //prędkość obrotu promieni wokół słońca
    }

    p.fill(p.lerpColor(cloudColor, cloudNightColor, t));
    p.pushMatrix();
    p.translate(cloudX, cloudY);
    p.beginShape();   //chmura 1
     p.vertex(58,56); p.vertex(63,47); p.vertex(69,43); p.vertex(77,42); p.vertex(84,45); p.vertex(92,48); p.vertex(94,50); p.vertex(97,45); p.vertex(104,41); p.vertex(114,40); p.vertex(124,45); p.vertex(130,51); p.vertex(135,51); 
     p.vertex(149,47); p.vertex(160,48); p.vertex(167,55); p.vertex(163,66); p.vertex(149,76); p.vertex(136,76); p.vertex(130,74); p.vertex(129,78); p.vertex(122,82); p.vertex(114,84); p.vertex(105,78); p.vertex(101,73); p.vertex(99,75); 
     p.vertex(92,82); p.vertex(84,83); p.vertex(73,78); p.vertex(70,74); p.vertex(66,70); p.vertex(61,68); p.vertex(47,74); p.vertex(39,73); p.vertex(34,61); p.vertex(36,52); p.vertex(49,49); p.vertex(59,48); p.vertex(61,48); p.vertex(64,50);
    p.endShape(CLOSE);
    p.popMatrix();

    p.pushMatrix();
    p.translate(cloudX2, cloudY2);
    p.beginShape();   //chmura 2
     p.vertex(123,13); p.vertex(133,9); p.vertex(148,6); p.vertex(161,8); p.vertex(171,15); p.vertex(173,19); p.vertex(166,27); p.vertex(150,32); 
     p.vertex(133,34); p.vertex(109,30); p.vertex(93,24); p.vertex(89,18); p.vertex(96,6); p.vertex(115,4); p.vertex(129,4); p.vertex(143,7); p.vertex(150,10);
    p.endShape(CLOSE);
    p.popMatrix();

    for (var i = 0; i < trees.length; i++) {
        trees[i].draw();    //drzewa
    }

    p.noStroke();
    p.fill(p.lerpColor(waterColor, waterNightColor, t));
    p.rect(0, 160, 400, 300); //woda
    
    p.fill(p.lerpColor(bridgeColor, bridgeNightColor, t));
    p.rect(0, 115, 120, 20); //pomost

    //ludzik
    p.pushMatrix();
    p.translate(100, -10);
    p.fill(0, 0, 0);
    p.ellipse(0, 72, 20, 20);
    p.rotate(p.radians(90));
    p.rect(80, 0, 30, 5);
    p.rotate(p.radians(45));
    p.rect(75, -75, 30, 5);
    p.rotate(p.radians(60));
    p.rect(-40, -92, 20, 5);
    p.rotate(p.radians(30));
    p.rect(-100, -80, 30, 5);
    p.rotate(p.radians(135));
    p.rect(-5, 85, 30, 5);
    p.popMatrix();
};

//funkcja odpowiadająca za noc
night = function(){
    p.background(p.lerpColor(nightSkyColor, skyColor, t2)); //płynne przejście koloru nieba na ciemny
    dayMusic.pause();
    nightMusic.play(); //muzyka nocna w tle
    nightMusic.volume = 0.5;

    for(var i = 0; i < stars.length; i++){
        p.fill(p.lerpColor(starsNightColor, starsColor, t2));
        p.ellipse(stars[i].x, stars[i].y, stars[i].size, stars[i].size);  //gwiazdy
    }

    p.fill(148, 144, 141);
    p.stroke();
    p.strokeWeight(1);
    p.pushMatrix();
    p.translate(moonX, 30);
    p.rotate(p.radians(moonRotate));    //obrót księżyca wokół własnej osi
    p.ellipse(0, 0, 40, 40); //księżyc
    p.fill(194, 190, 188);
    p.ellipse(2, 2, 2, 2); p.ellipse(8, 12, 2, 2); p.ellipse(17, -5, 2, 2); p.ellipse(-10, -12, 2, 2);  p.ellipse(-5, 5, 2, 2); p.ellipse(-15, 10, 2, 2); p.ellipse(5, -10, 2, 2); p.ellipse(0, 15, 2, 2); p.ellipse(-15, -2, 2, 2); 
    p.noStroke();
    p.popMatrix();
    if(!gamePaused) {
        moonX -= moonSpeed; //księżyc przesuwa się w lewo
        moonRotate -= 0.08;
    }

    p.pushMatrix();
    p.translate(cloudX, cloudY)
    p.fill(p.lerpColor(cloudNightColor, cloudColor, t2));
    p.beginShape();   //chmura 1
     p.vertex(58,56); p.vertex(63,47); p.vertex(69,43); p.vertex(77,42); p.vertex(84,45); p.vertex(92,48); p.vertex(94,50); p.vertex(97,45); p.vertex(104,41); p.vertex(114,40); p.vertex(124,45); p.vertex(130,51); p.vertex(135,51); 
     p.vertex(149,47); p.vertex(160,48); p.vertex(167,55); p.vertex(163,66); p.vertex(149,76); p.vertex(136,76); p.vertex(130,74); p.vertex(129,78); p.vertex(122,82); p.vertex(114,84); p.vertex(105,78); p.vertex(101,73); p.vertex(99,75); 
     p.vertex(92,82); p.vertex(84,83); p.vertex(73,78); p.vertex(70,74); p.vertex(66,70); p.vertex(61,68); p.vertex(47,74); p.vertex(39,73); p.vertex(34,61); p.vertex(36,52); p.vertex(49,49); p.vertex(59,48); p.vertex(61,48); p.vertex(64,50);
    p.endShape(CLOSE);

    p.translate(cloudX2, cloudY2);
    p.beginShape();   //chmura 2
     p.vertex(123,13); p.vertex(133,9); p.vertex(148,6); p.vertex(161,8); p.vertex(171,15); p.vertex(173,19); p.vertex(166,27); p.vertex(150,32); 
     p.vertex(133,34); p.vertex(109,30); p.vertex(93,24); p.vertex(89,18); p.vertex(96,6); p.vertex(115,4); p.vertex(129,4); p.vertex(143,7); p.vertex(150,10);
    p.endShape(CLOSE);
    p.popMatrix();
    
    p.pushMatrix();
    p.translate(0, -60);
    p.fill(p.lerpColor(landscapeNightColor, landscapeColor, t2));
    p.beginShape();   //krajobraz
     p.vertex(0, 296);p.vertex(0, 279);p.vertex(0, 265);p.vertex(0, 131);p.vertex(36, 134);p.vertex(77, 143);p.vertex(132, 157);p.vertex(179, 138);
     p.vertex(218, 125);p.vertex(271, 131);p.vertex(320, 131);p.vertex(348, 153);p.vertex(400, 166);p.vertex(400, 242);
    p.endShape(CLOSE);
    p.popMatrix();

    for (var i = 0; i < trees.length; i++) {
        trees[i].draw();    //drzewa
    }

    p.noStroke();
    p.fill(p.lerpColor(waterNightColor, waterColor, t2));
    p.rect(0, 160, 400, 300); //woda
    
    p.fill(p.lerpColor(bridgeNightColor, bridgeColor, t2));
    p.rect(0, 115, 120, 20); //pomost

    //ludzik
    p.pushMatrix();
    p.translate(100, -10);
    p.fill(0, 0, 0);
    p.ellipse(0, 72, 20, 20);
    p.rotate(p.radians(90));
    p.rect(80, 0, 30, 5);
    p.rotate(p.radians(45));
    p.rect(75, -75, 30, 5);
    p.rotate(p.radians(60));
    p.rect(-40, -92, 20, 5);
    p.rotate(p.radians(30));
    p.rect(-100, -80, 30, 5);
    p.rotate(p.radians(135));
    p.rect(-5, 85, 30, 5);
    p.popMatrix();
};

var onlyOnce = true; //zmienna pomocnicza, aby dźwięk fanfar nie odtwarzał się w kółko

//funkcja resetująca grę do stanu początkowego
reset = function() {
    if (onlyOnce) {
        fanfare.volume = 0.5;
        fanfare.play(); //dźwięk fanfar po ukończeniu gry
        onlyOnce = false;
    }

    p.fill(200, 50, 50);
    p.rect(50, 200, 300, 100, 10);

    p.fill(255, 255, 255);
    p.textSize(20);
    p.text("  Naciśnij ENTER, jeśli\nchcesz zacząć od nowa!", 90, 250);

    //reset gry po naciśnięciu ENTER
    if (p.keyPressed && p.keyCode == 10) {
        rod.fishCaught = 0;
        gamePaused = false;
        hookedFishIndex = -1;
        greenRect = 150;
        onlyOnce = true;
        dayTime = 0;
        sunX = 438;
        moonX = 420;

        fish = []; //usuwa poprzednie ryby
        for (var i = 0; i < fishNumber/2; i++) {
            fish.push(new Fish());  //tworzy nowe ryby
        }

        nightFish = []; //usuwa poprzednie ryby nocne
        for (var i = 0; i < fishNumber/2; i++) {
            nightFish.push(new NightFish());  //tworzy nowe ryby nocne
        }

        console.log("Game has been reset!");
    }
};

//główna funkcja rysująca
p.draw = function() {
    if(p.random(2000) < 1){
        Bubbles.volume = 0.4;
        Bubbles.play(); //efekt dźwiękowy bąbelków co jakiś czas
    }

    //funkcja mapuje wartości sunset i moonset z zakresu 0-15 do zakresu 0-1 (używane później w płynnych przejściach kolorów między dniem i nocą)
    t = p.map(sunset, 0, 15, 0, 1);
    t2 = p.map(moonset, 0, 15, 0, 1);


    if (!gamePaused) {

        dayTime += daySpeed

        //zachód słońca, ryby dzienne odpływają, a ryby nocne przypływają
        if (dayTime > 45 && dayTime < 105) {
            sunset += 0.0167;

            for (var i = 0; i < fish.length; i++) {
                fish[i].swimAway();
            }
            for (var i = 0; i < nightFish.length; i++) {
                nightFish[i].swimBack();
            }

        //zachód księżyca, ryby nocne odpływają, a ryby dzienne przypływają
        } else if (dayTime > 105) {
            sunset = 0;
            moonset += 0.0167;

            for (var i = 0; i < fish.length; i++) {
                fish[i].swimBack();
            }

            for (var i = 0; i < nightFish.length; i++) {
                nightFish[i].swimAway();
            }

        //dzień, ryby nocne nadal poza płótnem
        } else if (dayTime > 0 && dayTime < 45) {
            moonset = 0;
            
            for (var i = 0; i < nightFish.length; i++) {
                nightFish[i].swimAway();
            }
        } 

        //zmiana współrzędnych chmur w czasie
        cloudTimeX += 0.001;
        cloudTimeY += 0.001;
        cloudTimeX2 += 0.002;
        cloudTimeY2 += 0.001;
    }

    

    //jeśli czas osiągnie 120, dzień resetuje się
    if (dayTime > 120) {
            dayTime = 0;
            isDay = true;
            sunX = 438;
            moonX = 420;
        }

        if (dayTime > 60) {
            isDay = false;
        }
    
    //zmiana położenia chmur za pomocą funkcji p.noise() - sprawia, że chmury poruszają się naturalniej i płynniej
    var cloudNoiseWidth = p.map(p.noise(cloudTimeX), 0, 1, -150, 150);
    var cloudNoiseHeight = p.map(p.noise(cloudTimeY), 0, 1, -60, -10);
    var cloudNoiseWidth2 = p.map(p.noise(cloudTimeX2), 0, 1, 100, 250);
    var cloudNoiseHeight2 = p.map(p.noise(cloudTimeY2), 0, 1, 0, 40);

    //współrzędne chmur
    cloudX = cloudNoiseWidth;
    cloudY = cloudNoiseHeight;
    cloudX2 = cloudNoiseWidth2;
    cloudY2 = cloudNoiseHeight2;

    if (isDay) {
        day();
        if (dayMusicActivated && dayMusic.paused) {
            dayMusic.play();
        }
    } else {
        night();
        if (!dayMusic.paused) {
            dayMusic.pause();
        }
    }

    //zmiana koloru piasku w zależności od pory dnia
    if (isDay) {
        p.fill(p.lerpColor(sandColor, sandNightColor, t));
    } else {
        p.fill(p.lerpColor(sandNightColor, sandColor, t2));
    }
    p.beginShape();   //piasek na dnie wody
     p.vertex(0,400); p.vertex(0,383); p.vertex(1,383); p.vertex(11,381); p.vertex(23,376); p.vertex(39,372); p.vertex(64,370); p.vertex(91,376); p.vertex(108,380); p.vertex(130,380); p.vertex(150,382); p.vertex(166,381); p.vertex(193,378);
     p.vertex(217,374); p.vertex(229,376); p.vertex(252,379); p.vertex(279,386); p.vertex(310,393); p.vertex(324,393); p.vertex(341,394); p.vertex(365,392); p.vertex(381,388); p.vertex(390,383); p.vertex(400,386); p.vertex(400,400);
    p.endShape(CLOSE);

   
    waveAngle += 0.025
    angle = waveAngle;  //kąt początkowy dla fali

    //fala na wodzie
    for (var x = 0; x <= 400; x += 10) {
        var y = waveAmplitude * p.sin(angle); //wzór na wyliczenie położenia współrzędnej y fali wodnej w danym punkcie x (p.sin(angle) zwraca wartości od -1 do 1 a waveamplitude je przeskalowuje)

        //zmiana koloru wody w zależności od pory dnia
        if (isDay) {
            p.fill(p.lerpColor(waterColor, waterNightColor, t));
        } else {
            p.fill(p.lerpColor(waterNightColor, waterColor, t2));
        }

        //kółka położone obok siebie poruszające się góra-dół imitują falę
        p.ellipse(x, y + 155, 40, 50);

        //przesunięcie kąta dla kolejnego punktu fali
        angle += waveAngleVelocity;

        rod.ifCollision(y + 130);   //sprawdzenie kolizji haczyka z falą
    }

    //wywołanie cząsteczek wody podczas kontaktu haczyka z powierzchnią
    for (var i = 0; i < waterParticles.length; i++) {
        waterParticles[i].draw();
        waterParticles[i].update();

        if(waterParticles[i].position.y > 140){
            waterParticles.splice(i, 1);
        }
    }

    var bubbleStroke = p.map(t, 0, 1, 255, 100);
    var bubbleStroke2 = p.map(t2, 0, 1, 100, 255);
    //bąbelki wodne
    if (isDay) {
        p.fill(p.lerpColor(waterColor, waterNightColor, t));
        p.stroke(255, 255, 255, bubbleStroke);
    } else {
        p.fill(p.lerpColor(waterNightColor, waterColor, t2));
        p.stroke(255, 255, 255, bubbleStroke2);
    }
    for (var i = 0; i < bubbles.length; i++) {
        bubbles[i].draw();
        bubbles[i].update();
        if(bubbles[i].position.y < 140){
            bubbles.splice(i, 1);
            bubbles.push(new bubblesParticle());
        }
    }
    
    
    //kamienie
    if (isDay) {
        p.fill(p.lerpColor(rockColor, rockNightColor, t));
    } else {
        p.fill(p.lerpColor(rockNightColor, rockColor, t2));
    }
    p.noStroke();
    for (var i = 0; i < rocks.length; i++) {
        p.rect(rocks[i].x, rocks[i].y, rocks[i].width, rocks[i].height, 50);
        for (var j = 0; j < rocks.length; j++) { //pętla pomocnicza do sprawdzenia warunku
            if(i !== j && rocks[i].x < rocks[j].x + rocks[j].width && rocks[i].x + rocks[i].width > rocks[j].x){    //warunek sprawdzający czy kamienie się na siebie nie nakładają
                rocks[i].x = p.random(10, 350);
                rocks[j].x = p.random(10, 350);
            }
        }
    }
    
    //wodorosty
    p.rectMode(CENTER);
    p.pushMatrix();
    if (isDay) {
        p.fill(p.lerpColor(seaweedColor, seaweedNightColor, t));
    } else {
        p.fill(p.lerpColor(seaweedNightColor, seaweedColor, t2));
    }
    p.translate(200, 200);
    p.rotate(p.radians(90));
    for (var i = 0; i < seaweed.length; i++) {
        p.rect(seaweed[i].x, seaweed[i].y, seaweed[i].height, seaweed[i].width);
        if (p.frameCount % 30 === 0 && p.random(0, 1) < 0.5) {  //wodorosty delikatnie się poruszają
        seaweed[i].height += p.random(-10, 10);
        }
    }
    p.popMatrix();
    p.rectMode(CORNER);
    
    //wywołanie funkcji rysującej wędkę
    rod.draw();
    
    //ryby dzienne
    for (var i = 0; i < fish.length; i++) {
        fish[i].draw();
    
        if(!gamePaused && !fish[i].fishAway){
            fish[i].swim();
        }
    
        fish[i].isHooked(rod, i); //argument i jest przekazywany do argumentu index w metodzie isHooked i Hooked
    }

    //ryby nocne
    for (var i = 0; i < nightFish.length; i++) {
        nightFish[i].draw();
    
        if(!gamePaused && !nightFish[i].nightFishAway){
            nightFish[i].swim();
        }
    
        nightFish[i].isHooked(rod, i); //argument i jest przekazywany do argumentu index w metodzie isHooked i Hooked
    
    }
    
    //wywołanie minigry
    if (gamePaused && (hookedFishIndex !== -1 || hookedNightFishIndex !== -1)) {

        if (hookedFishIndex !== -1) {
            fish[hookedFishIndex].miniGame(rod, hookedFishIndex); //hookedFishIndex przechowuje indeks zahaczonej ryby
        } else if(hookedNightFishIndex !== -1) {
            nightFish[hookedNightFishIndex].miniGame(rod, hookedNightFishIndex);
        }
    }

    //cząsteczki podczas minigry
    for (var i = 0; i < miniGameParticles.length; i++) {
                miniGameParticles[i].draw();
                miniGameParticles[i].update();
    }

    //wywołanie funkcji reset po złapaniu wszystkich ryb
    if(rod.fishCaught === fishNumber){ 
        p.fill(0, 0, 0);
        p.textSize(25);
        p.text(`    Gratulacje\nZłapałeś ${fishNumber} ryb!`, 100, 160);
    
        reset();
    }
    
    p.fill(0, 0, 0);
    p.textSize(15);
    p.text(`Złapane ryby: ${rod.fishCaught}`, 5, 15);
    
        //console.log("p.keyPressed: ", p.keyPressed, "p.keyCode: ", p.keyCode);
    
    //ruch żyłki w zależności od wciśniętej spacji
    if (!gamePaused && p.keyPressed && p.keyCode === 32) {
        rod.lineDown();
    } else if (!gamePaused) {
        rod.lineUp();
    }
};


};

const canvas = document.getElementById("mycanvas");

if (canvas) {
    window.fishGameProcessingInstance = new Processing(canvas, programCode);
    console.log("ProcessingJS instance created:", window.fishGameProcessingInstance);
} else {
    console.log("Nie znaleziono <canvas id='mycanvas'>! Instancja gry nie została utworzona.");
}

