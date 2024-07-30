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
    let otherUser: any;
    let adminToken: string;
    let normalToken: string;
    let otherToken: string;
    let locationId: mongoose.Types.ObjectId;
    let lockerId: mongoose.Types.ObjectId;
    let reservationId: mongoose.Types.ObjectId;

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
        await Locker.deleteMany({});
        await Localisation.deleteMany({});
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

    });

    it('should create a reservation with normal user', async () => {
        const response = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.locker).toBe(lockerId.toString());
        expect(response.body.members).toEqual(expect.arrayContaining([otherUser._id.toString()]));
        reservationId = response.body._id;
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
                lockerId: new mongoose.Types.ObjectId().toString(),
                members: [otherUser._id.toString()],
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Le casier n\'existe pas');
    });

    it('should get pending reservations', async () => {
        // Créer une réservation
        const createResponse = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });

        // Vérifier la réponse de création
        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toHaveProperty('_id');

        // Obtenir les réservations en attente
        const response = await request(app)
            .get('/api/reservation/pendingReservation')
            .set('Authorization', `Bearer ${adminToken}`);

        // Vérifier la réponse
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: createResponse.body._id, // Vérifie l'ID de la réservation
                locker: expect.objectContaining({
                    _id: lockerId.toString(),
                    number: 1,
                    localisation: expect.any(Object), // Vérifie que la localisation est un objet
                    status: 'unavailable',
                }),
                owner: expect.objectContaining({
                    _id: normalUser._id.toString(),
                    firstname: 'Normal',
                    lastname: 'User',
                    email: 'normal.user@myges.fr',
                    role: 'user',
                }),
                members: expect.arrayContaining([
                    expect.objectContaining({
                        _id: otherUser._id.toString(),
                        firstname: 'Other',
                        lastname: 'User',
                    }),
                ]),
                status: 'pending',
            }),
        ]));
    });

    it('should validate or refuse a reservation', async () => {
        const createResponse = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });
        reservationId = createResponse.body._id;

        const response = await request(app)
            .patch('/api/reservation/validateOrRefuse')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                reservationId: reservationId.toString(),
                status: 'accepted', // 'approved' or 'refused'
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'accepted');
    });

    it('should terminate a reservation', async () => {
        // Créer une réservation en attente
        const createResponse = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });

        reservationId = createResponse.body._id;

        // Valider la réservation d'abord
        await request(app)
            .patch('/api/reservation/validateOrRefuse')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                reservationId: reservationId.toString(),
                status: 'approved',
            });

        // Terminer la réservation
        const response = await request(app)
            .patch('/api/reservation/terminateReservation')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                reservationId: reservationId.toString(),
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'terminated');
    });

    it('should get reservations by locker', async () => {
        // Créer une réservation
        await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });

        // Obtenir les réservations par casier
        const response = await request(app)
            .get(`/api/reservation/getLockerReservations/${lockerId.toString()}`)
            .set('Authorization', `Bearer ${adminToken}`);

        // Vérifier la réponse
        expect(response.status).toBe(200);

        // Vérifie les réservations renvoyées
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.any(String),
                locker: expect.objectContaining({
                    _id: lockerId.toString(),
                    number: expect.any(Number),
                    localisation: expect.objectContaining({
                        _id: expect.any(String),
                        name: expect.any(String),
                        accessibility: expect.any(Boolean),
                    }),
                    status: expect.any(String),
                }),
                members: expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.any(String),
                        email: expect.any(String),
                        firstname: expect.any(String),
                        lastname: expect.any(String),
                        role: expect.any(String),
                    }),
                ]),
                owner: expect.objectContaining({
                    _id: expect.any(String),
                    email: expect.any(String),
                    firstname: expect.any(String),
                    lastname: expect.any(String),
                    role: expect.any(String),
                }),
                status: 'pending',
            }),
        ]));
    });

    it('should leave a reservation', async () => {
        // Créer une réservation
        const createResponse = await request(app)
            .post('/api/reservation/create')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                lockerId: lockerId.toString(),
                members: [otherUser._id.toString()],
            });

        const reservationId = createResponse.body._id;

        // Quitter la réservation
        const leaveResponse = await request(app)
            .patch('/api/reservation/leaveReservation')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                reservationId: reservationId.toString(),
            });

        expect(leaveResponse.status).toBe(200);
        expect(leaveResponse.body).toHaveProperty('status', 'pending');

        // Vérifier que la liste des membres est vide
        const reservationResponse = await request(app)
            .get(`/api/reservation/getCurrentReservation/`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(reservationResponse.body).toHaveLength(0);
    });


});
