const bcrypt = require('bcryptjs');

const pass = 'Admin123';
const hash = "$2a$10$Azk0eNazmc9jz.nKzwPF9uD80G9y.E2LtZsm6QxIZVvx3S2AQz69K";

async function checkPassword() {
    try {
        const match = await bcrypt.compare(pass, hash);
        if (!match) {
            console.log("Wrong Match");
        } else {
            console.log("Correct Match");
        }
        console.log("Match result:", match);
    } catch (error) {
        console.error("Error comparing passwords:", error);
    }
}

checkPassword();
