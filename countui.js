import { anggota } from './array.js';

function extractAngkatanFromType(typeString) {
    if (!typeString) return null;
    
    console.log("Processing type:", typeString); 
    
    
    const patterns = [
        /Angkatan\s*(\d+)/i,        // "Angkatan X"
        /Ketua\s*Angkatan\s*(\d+)/i, // "Ketua Angkatan X" 
    ];
    
    for (let pattern of patterns) {
        const match = typeString.match(pattern);
        if (match && match[1]) {
            console.log("Found angkatan:", match[1]);
            return parseInt(match[1]);
        }
    }
    
    console.log("No angkatan found in type"); 
    return null;
}


function hitungStatistikDariType() {
   
    const anggotaAktif = anggota.filter(a => 
        a.status.toLowerCase() === "aktif"
    );
    
    console.log("Anggota Aktif:", anggotaAktif.length); 
    
    
    const semuaAngkatan = [];
    
    anggotaAktif.forEach(anggota => {
        const angkatanDariType = extractAngkatanFromType(anggota.type);
        if (angkatanDariType) {
            semuaAngkatan.push(angkatanDariType);
        }
    });
    
    console.log("Semua Angkatan:", semuaAngkatan);
    
    if (semuaAngkatan.length === 0) {
        console.log("Menggunakan alternatif: mengambil dari field angkatan");
        anggotaAktif.forEach(anggota => {
            if (anggota.angkatan && anggota.angkatan.length > 0) {
                const angkatanNum = parseInt(anggota.angkatan[0]);
                if (!isNaN(angkatanNum)) {
                    semuaAngkatan.push(angkatanNum);
                }
            }
        });
    }
    
    
    const angkatanUnik = [...new Set(semuaAngkatan)].sort((a, b) => a - b);
    
    console.log("Angkatan Unik:", angkatanUnik); 
    
    const statistikPerAngkatan = {};
    const anggotaPerAngkatan = {};
    
    angkatanUnik.forEach(angkatan => {
        const anggotaAngkatan = anggotaAktif.filter(a => {
            const angkatanDariType = extractAngkatanFromType(a.type);
            if (angkatanDariType === angkatan) return true;
            
            
            if (a.angkatan && a.angkatan.includes(angkatan.toString())) {
                return true;
            }
            return false;
        });
        
        statistikPerAngkatan[angkatan] = anggotaAngkatan.length;
        anggotaPerAngkatan[angkatan] = anggotaAngkatan;
    });
    
    const result = {
        totalAngkatan: angkatanUnik.length,
        angkatanTerendah: angkatanUnik.length > 0 ? Math.min(...angkatanUnik) : 0,
        angkatanTertinggi: angkatanUnik.length > 0 ? Math.max(...angkatanUnik) : 0,
        totalAnggota: anggotaAktif.length,
        statistikPerAngkatan: statistikPerAngkatan,
        anggotaPerAngkatan: anggotaPerAngkatan,
        daftarAngkatan: angkatanUnik,
        semuaDataAngkatan: semuaAngkatan
    };
    
    console.log("Final Result:", result); 
    return result;
}


function updateStatistikDariType() {
    try {
        const statistik = hitungStatistikDariType();
        
        console.log("Statistik dari Type:", statistik);
        
        
        const elements = {
            'currentAngkatan': statistik.totalAngkatan || 0,
            'totalMembers': statistik.totalAnggota || 0,
            'angkatanList': statistik.daftarAngkatan.join(', ') || '-',
            'lowestAngkatan': statistik.angkatanTerendah || 0
        };
        
        Object.keys(elements).forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = elements[elementId];
                console.log(`Updated ${elementId}:`, elements[elementId]); 
            } else {
                console.log(`Element ${elementId} not found`); 
            }
        });
        
        
        renderStatistikCardsDariType(statistik);
        
    } catch (error) {
        console.error("Error in updateStatistikDariType:", error);
    }
}

function renderStatistikCardsDariType(statistik) {
    const container = document.getElementById('statistikCards');
    if (!container) {
        console.log("Container statistikCards not found");
        return;
    }
    
    const html = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800 hover:shadow-lg transition">
                <div class="text-3xl font-bold text-green-600">${statistik.totalAngkatan || 0}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">Angkatan Aktif</div>
                <div class="text-xs text-gray-500 mt-1">Real time <br> (to-year)</div>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-800 hover:shadow-lg transition">
                <div class="text-3xl font-bold text-blue-600">${statistik.totalAnggota || 0}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Anggota</div>
                <div class="text-xs text-gray-500 mt-1">Real time</div>
                <div class="text-xs text-gray-500 mt-1">Status: Aktif</div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 text-center border border-purple-200 dark:border-purple-800 hover:shadow-lg transition">
                <div class="text-3xl font-bold text-purple-600">${statistik.angkatanTertinggi || 0}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">Angkatan Tertinggi</div>
                <div class="text-xs text-gray-500 mt-1">Terbaru</div>
            </div>
            
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 text-center border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition">
                <div class="text-3xl font-bold text-yellow-600">${statistik.angkatanTerendah || 0}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">Angkatan Pertama</div>
                <div class="text-xs text-gray-500 mt-1">Paling Awal</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    console.log("Statistik cards rendered");
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Loaded - Initializing statistik");
    updateStatistikDariType();
});

function testStatistik() {
    console.log("=== TEST STATISTIK ===");
    console.log("Total anggota:", anggota.length);
    console.log("Anggota aktif:", anggota.filter(a => a.status.toLowerCase() === "aktif").length);
    console.log("Anggota dengan type mengandung 'Angkatan':", anggota.filter(a => a.type && a.type.includes("Angkatan")).length);
    
    anggota.forEach((a, i) => {
        if (a.type && a.type.includes("Angkatan")) {
            console.log(`Anggota ${i}: ${a.nama} - Type: ${a.type} - Angkatan dari type: ${extractAngkatanFromType(a.type)}`);
        }
    });
}

// Jalankan test

testStatistik();
