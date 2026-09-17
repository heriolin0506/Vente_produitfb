document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('boutique')) {
        loadBoutique();
    } else if (document.getElementById('produits-list')) {
        loadAccueil();
    }
});

// --- ACCUEIL ---
function loadAccueil() {
    fetch('/api/produits')
        .then(res => res.json())
        .then(produits => {
            const list = document.getElementById('produits-list');
            if (produits.length === 0) {
                list.innerHTML = '<div class="col-12 text-center text-muted">Mbola tsy misy vokatra ao amin\'ny tranokala.</div>';
                return;
            }
            list.innerHTML = produits.slice(0, 4).map(p => createCard(p)).join('');
        })
        .catch(err => console.error(err));
}

// --- BOUTIQUE ---
let allProduits = [];
function loadBoutique() {
    fetch('/api/produits')
        .then(res => res.json())
        .then(produits => {
            allProduits = produits;
            displayProduits(produits);
            populateFilters(produits);
            document.getElementById('productCount').innerText = produits.length;
        })
        .catch(err => console.error(err));

    document.getElementById('searchInput').addEventListener('input', filterProduits);
    document.getElementById('categorieFilter').addEventListener('change', filterProduits);
    document.getElementById('marqueFilter').addEventListener('change', filterProduits);
}

// --- CARD (Misy bouton roa: WhatsApp sy Voir détail) ---
function createCard(p) {
    const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : 'https://via.placeholder.com/300x200?text=IMPACT-PC';
    const whatsappLink = `https://wa.me/261385986522?text=Salama, te-hahafantatra bebe kokoa momba ity vokatra ity aho: ${p.nom} - ${parseInt(p.prix).toLocaleString()} Ar`;
    
    // Isan'ny sary
    const imageCount = p.images ? p.images.length : 0;
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="product-card">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${p.nom}">
                    ${imageCount > 1 ? `<span class="image-count">${imageCount} sary</span>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${p.categorie || 'Général'}</div>
                    <h3>${p.nom}</h3>
                    <div class="product-brand"><i class="fas fa-tag"></i> ${p.marque || 'N/A'}</div>
                    <div class="product-bottom">
                        <strong>${parseInt(p.prix).toLocaleString()} Ar</strong>
                    </div>
                    <div class="product-actions">
                        <a href="${whatsappLink}" target="_blank" class="btn-whatsapp-card">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>
                        <a href="/produit.html?id=${p.id}" class="btn-detail-card">
                            Voir détail <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayProduits(produits) {
    const list = document.getElementById('produits-list');
    if (produits.length === 0) {
        list.innerHTML = '<div class="col-12 text-center" style="color: #888; padding: 60px;">Tsy misy vokatra hita.</div>';
        return;
    }
    list.innerHTML = produits.map(p => createCard(p)).join('');
}

function populateFilters(produits) {
    const categories = [...new Set(produits.map(p => p.categorie).filter(c => c))];
    const marques = [...new Set(produits.map(p => p.marque).filter(m => m))];
    const catSelect = document.getElementById('categorieFilter');
    const marqueSelect = document.getElementById('marqueFilter');
    
    categories.forEach(c => catSelect.innerHTML += `<option value="${c}">${c}</option>`);
    marques.forEach(m => marqueSelect.innerHTML += `<option value="${m}">${m}</option>`);
}

function filterProduits() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const categorie = document.getElementById('categorieFilter').value;
    const marque = document.getElementById('marqueFilter').value;

    const filtered = allProduits.filter(p => {
        const matchesSearch = p.nom.toLowerCase().includes(search);
        const matchesCategorie = !categorie || p.categorie === categorie;
        const matchesMarque = !marque || p.marque === marque;
        return matchesSearch && matchesCategorie && matchesMarque;
    });
    displayProduits(filtered);
    document.getElementById('productCount').innerText = filtered.length;
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categorieFilter').value = '';
    document.getElementById('marqueFilter').value = '';
    displayProduits(allProduits);
    document.getElementById('productCount').innerText = allProduits.length;
}