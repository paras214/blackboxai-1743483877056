// Initialize Firebase (already initialized in chat.js)
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    loadContacts();

    // Form submission
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewContact();
    });
});

async function addNewContact() {
    const name = document.getElementById('contact-name').value.trim();
    const number = document.getElementById('contact-number').value.trim();
    const specialization = document.getElementById('contact-specialization').value;

    if (!name || !number) {
        alert('Please fill all required fields');
        return;
    }

    if (number.length !== 10 || !/^\d+$/.test(number)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }

    const newContact = {
        name,
        number,
        specialization,
        avatar: getRandomAvatar(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('contacts').add(newContact);
        loadContacts();
        clearForm();
    } catch (error) {
        console.error("Error adding contact: ", error);
        alert('Error saving contact');
    }
}

function loadContacts() {
    db.collection('contacts').onSnapshot(snapshot => {
        const contactsList = document.getElementById('contacts-list');
        contactsList.innerHTML = '';
        snapshot.forEach(doc => {
            const contact = doc.data();
            contactsList.innerHTML += `
                <div class="contact-card rounded-xl p-6">
                    <div class="flex items-center mb-4">
                        <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-blue-100 text-blue-600 mr-4">
                            ${contact.avatar}
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold">${contact.name}</h3>
                            <p class="text-gray-600">${contact.specialization}</p>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <a href="tel:${contact.number}" class="text-blue-500 hover:text-blue-700">
                            <i class="fas fa-phone mr-1"></i> ${contact.number}
                        </a>
                        <button onclick="deleteContact('${doc.id}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    });
}

async function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        try {
            await db.collection('contacts').doc(id).delete();
        } catch (error) {
            console.error("Error deleting contact: ", error);
            alert('Error deleting contact');
        }
    }
}

function getRandomAvatar() {
    const avatars = ['👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔬', '👨‍🏫', '👩‍🏭', '🧑‍🔧', '🧑‍🏫'];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

function clearForm() {
    document.getElementById('contact-form').reset();
}