import request from 'supertest';
import { app } from '../src/app';
import User from '../src/models/userModel';
import Locker from '../src/models/lockerModel';
import Localisation from '../src/models/localisationModel';
import Reservation from '../src/models/reservationModel';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

describe('Reservation Services', () => {
    let adminUser: any;
    let normalUser: any;
    let otherUser: any; // Un autre utilisateur pour les réservations
    let adminToken: string;
    let normalToken: string;
    let otherToken: string;
    let locationId: mongoose.Types.ObjectId;
    let lockerId: mongoose.Types.ObjectId;

    beforeAll(async () => {
        // Réinitialiser la base de données
        await User.deleteMany({});
        await Locker.deleteMany({});
        await Localisation.deleteMany({});
        await Reservation.deleteMany({});

        // Créer des utilisateurs
        adminUser = await User.create({
            firstname: 'Admin',
            lastname: 'User',
            email: 'admin.user@myges.fr',
            password: await bcrypt.hash('adminpassword', 10),
            role: 'admin',
            isEmailVerified: true,
        });

        normalUser = await User.create({
            firstname: 'Normal',
            lastname: 'User',
            email: 'normal.user@myges.fr',
            password: await bcrypt.hash('userpassword', 10),
            role: 'user',
            isEmailVerified: true,
        });

        otherUser = await User.create({
            firstname: 'Other',
            lastname: 'User',
            email: 'other.user@myges.fr',
            password: await bcrypt.hash('otherpassword', 10),
            role: 'user',
            isEmailVerified: true,
        });

        // Créer une localisation
        const location = await Localisation.create({
            name: 'Location 1',
            accessibility: true,
        });
        locationId = location._id as mongoose.Types.ObjectId;

        // Créer un casier
        const locker = await Locker.create({
            number: 1,
            localisation: locationId,
        });
        lockerId = locker._id as mongoose.Types.ObjectId;

        // Connexion pour obtenir les tokens
        const adminResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'admin.user@myges.fr', password: 'adminpassword' });
        adminToken = adminResponse.body.token;

        const normalResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'normal.user@myges.fr', password: 'userpassword' });
        normalToken = normalResponse.body.token;

        const otherResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'other.user@myges.fr', password: 'otherpassword' });
        otherToken = otherResponse.body.token;
    });

    afterEach(async () => {
        await Reservation.deleteMany({});
    });

    it('should create a reservation with normal user', async () => {
        const response = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(), // Convertir en chaîne de caractères
                members: [otherUser._id.toString()],
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.locker).toBe(lockerId.toString());
        expect(response.body.members).toEqual(expect.arrayContaining([otherUser._id.toString()]));
    });

    it('should not create a reservation if the locker is already reserved', async () => {
        // Créer une première réservation
        await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });

        // Tenter de créer une deuxième réservation pour le même casier
        const response = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [adminUser._id.toString()],
            });

        expect(response.status).toBe(403); // Assuming 403 Forbidden for conflicting reservation
        expect(response.body.error).toBe('Le casier est déjà occupé');
    });

    it('should not create a reservation if locker does not exist', async () => {
        const response = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: new mongoose.Types.ObjectId().toString(), // ID invalide
                members: [otherUser._id.toString()],
            });
        console.log("no locker",response.status)
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Le casier n\'existe pas');
    });

    it('should get reservations by user', async () => {
        // Créer une réservation pour le test
        await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });

        const response = await request(app)
            .get('/api/reservation/getCurrentReservation')
            .set('Authorization', `Bearer ${normalToken}`);

        const reservations: any[] = response.body;

        expect(response.status).toBe(200);
        expect(reservations.length).toBe(1);
        expect(reservations[0].locker._id).toBe(lockerId.toString());
    });
});
