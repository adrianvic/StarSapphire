const search = document.querySelector("#search");
const results = document.querySelector("#results");
const selected = document.querySelector("#selected");
const star = document.querySelector("#star");
const preloadedImages = [];
let starRotation = 0;

const req = await fetch('services.json');

const services = await req.json();
console.log(services)

services.sort((a, b) => a.name.localeCompare(b.name));

services.forEach(s => {
    if (s.logo) preloadImage(s.logo);
})

search.addEventListener('keydown', (e) => {
    if (e.key == "Enter") {
        e.preventDefault();
        const button = document.querySelector('#open');
        button.click();
    } else if (e.key == "ArrowUp") {
        e.preventDefault();
        document.querySelector('.selection').nextElementSibling?.click()
    } else if (e.key == "ArrowDown") {
        e.preventDefault()
        document.querySelector('.selection').previousElementSibling?.click()
    }
})

search.addEventListener('input', (e) => {
    window.location.hash = search.value;
    starRotation += 10;
    star.style.transform = `rotate(${starRotation}deg)`;
    reload();
});

const wait = t => new Promise((resolve, reject) => setTimeout(resolve, t))

function reload() {
    results.innerHTML = '';
    selected.innerHTML = '';
    
    const favorites = JSON.parse(localStorage.getItem('favorites') ?? "[]");
    let filtered = services.filter(a => a.name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1)
    
    filtered = filtered.sort((a, b) => {
        const aIsFavorite = favorites.includes(a.name);
        const bIsFavorite = favorites.includes(b.name);
        
        return Number(bIsFavorite) - Number(aIsFavorite);
    });
    
    if (filtered.length === 0) {
        results.innerText = "Nothing here"
        return;
    }
    
    filtered.forEach(s => {
        const el = document.createElement('div');
        
        el.classList.add('service');
        el.innerText = s.name;
        el.dataset.name = s.name;
        
        if (favorites.indexOf(s.name) !== -1) el.classList.add('favorite');
        
        el.addEventListener('click', () => {
            select(s);
        })
        
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            favorite(s.name);
        })
        
        results.appendChild(el)
    });
    
    select(filtered[0]);
}

function favorite(name) {
    const favorites = JSON.parse(localStorage.getItem('favorites') ?? "[]");
    
    if (favorites.indexOf(name) !== -1) {
        favorites.splice(favorites.indexOf(name), 1);
    } else {
        favorites.push(name);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    reload();
}

function select(selection) {
    document.querySelectorAll('.selection').forEach(s => s.classList.remove('selection'));
    
    selected.innerHTML = `
    <img src="./logos/${selection.logo}"
        style='
            ${selection.padding ? `padding: ${selection.padding}; ` : ""}
            ${selection.background ? `background: ${selection.background}; ` : ""}
            ${selection.color ? `color: ${selection.color}; ` : ""}
    '>
    <div class="info">
        <p>${selection.description || "<i>No description provided.</i>"}</p>
        ${selection.link ? `<a href="${selection.link}"><button id="open">Open</button></a>` : ''}
    </div>
    `
    
    selected.querySelector('#open')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await die();
        window.location.href = selection.link;
    });
    
    const sel = document.querySelector(`[data-name="${selection.name}"]`);
    if (sel) sel.classList.add('selection');
}

function preloadImage(url) {
    const img = new Image();
    img.src = `./logos/${url}`;
    preloadedImages.push(img);
}

async function die() {
    document.querySelector('body').style.transition = ".4s";
    document.querySelector('body').style.overflow = 'hidden';
    document.querySelector('body').style.transform = `translateY(100%)`;
    await wait(400);
}

search.value = window.location.hash.substring(1);
search.focus();
reload();