const token = localStorage.getItem('token');
if (!token) window.location.href = '/admin/login.html';

// --- MAKA NY VOKATRA ---
function loadProduits() {
    fetch('/api/produits')
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById('produitsTable');
            if (data.length === 0) {
                table.innerHTML = '<tr><td colspan="6" class="text-center" style="color: #888; padding: 40px;">Mbola tsy misy vokatra...</td></tr>';
                return;
            }
            table.innerHTML = data.map(p => `
                <tr style="border-bottom: 1px solid #292929;">
                    <td style="padding: 15px;">
                        <img src="${p.images && p.images.length > 0 ? p.images[0].url : 'https://via.placeholder.com/50'}" 
                             width="55" height="55" 
                             style="object-fit: cover; border-radius: 10px; border: 1px solid #292929;">
                    </td>
                    <td style="padding: 15px; color: #fff; font-weight: 600;">${p.nom}</td>
                    <td style="padding: 15px; color: #aaa;">${p.categorie}</td>
                    <td style="padding: 15px; color: #ff5722; font-weight: 700;">${parseInt(p.prix).toLocaleString()} Ar</td>
                    <td style="padding: 15px; color: ${p.stock > 0 ? '#25d366' : '#ff4444'}; font-weight: 600;">${p.stock}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button class="btn btn-sm" onclick="editProduit(${p.id})" style="background: #0084ff; color: #fff; border-radius: 8px; margin-right: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm" onclick="deleteProduit(${p.id})" style="background: #ff4444; color: #fff; border-radius: 8px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        });
}

// --- FAFANA NY FORMULAIRE ---
function resetForm() {
    document.getElementById('produitForm').reset();
    document.getElementById('produitId').value = '';
    document.getElementById('modalTitle').innerText = 'Ajouter un produit';
    document.getElementById('imagesFiles').value = '';
    document.getElementById('imagesUrl').value = '';
}

// --- TEHIRIZO NY VOKATRA (Upload + URL) ---
async function saveProduit() {
    const id = document.getElementById('produitId').value;
    const fileInput = document.getElementById('imagesFiles');
    const urlInput = document.getElementById('imagesUrl');
    
    // Ampiasao FormData satria misy "file"
    const formData = new FormData();
    formData.append('nom', document.getElementById('nom').value);
    formData.append('categorie', document.getElementById('categorie').value);
    formData.append('marque', document.getElementById('marque').value);
    formData.append('prix', document.getElementById('prix').value);
    formData.append('stock', document.getElementById('stock').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('specs', document.getElementById('specs').value);
    
    // 1. Ampidiro ny sary avy amin'ny FICHIER (raha misy)
    if (fileInput.files.length > 0) {
        for (let i = 0; i < Math.min(fileInput.files.length, 5); i++) {
            formData.append('images', fileInput.files[i]);
        }
    }

    // 2. Ampidiro ny sary avy amin'ny URL (raha misy)
    if (urlInput.value.trim() !== '') {
        formData.append('imagesUrl', urlInput.value);
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/produits/${id}` : '/api/produits';

    const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (res.ok) {
        alert('Vita soa aman-tsara!');
        location.reload();
    } else {
        const err = await res.json();
        alert('Nisy olana: ' + (err.error || 'Tsy fantatra'));
    }
}

// --- FAFANA NY VOKATRA ---
async function deleteProduit(id) {
    if (!confirm('Tena hofafana ity vokatra ity ve?')) return;
    const res = await fetch(`/api/produits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) location.reload();
    else alert('Nisy olana tamin\'ny famafana.');
}

// --- FANOVANA NY VOKATRA ---
// --- FANOVANA NY VOKATRA ---
async function editProduit(id) {
    const res = await fetch(`/api/produits/${id}`);
    const p = await res.json();
    document.getElementById('produitId').value = p.id;
    document.getElementById('nom').value = p.nom;
    document.getElementById('categorie').value = p.categorie;
    document.getElementById('marque').value = p.marque;
    document.getElementById('prix').value = p.prix;
    document.getElementById('stock').value = p.stock;
    document.getElementById('description').value = p.description;
    document.getElementById('specs').value = p.specs;
    
    // Asehoy ny sary efa misy (URL)
    if (p.images && p.images.length > 0) {
        // Raha "uploads" ny sary (fichier), dia ampidiro ao amin'ny "imagesUrl" ho rohy
        const urls = p.images.map(img => img.url).join('\n');
        document.getElementById('imagesUrl').value = urls;
    } else {
        document.getElementById('imagesUrl').value = '';
    }
    
    document.getElementById('modalTitle').innerText = 'Modifier un produit';
    new bootstrap.Modal(document.getElementById('produitModal')).show();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/admin/login.html';
}

loadProduits();