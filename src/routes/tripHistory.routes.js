// routes/tripHistoryRoutes.js
import express from 'express';
import { Router } from "express";

import {
    createTripHistory,
    deleteTripHistory,
    getAllTripHistories,
    getTripHistoryById,
    updateTripHistory
} from '../controllers/trip.history.controller.js';
import { authenticateToken } from '../controllers/auth.controller.js';


const router = Router();


// Create a new trip history
router.route('/create-trip').post(authenticateToken, createTripHistory);

// Get all trip histories
router.route('/getAllTripHistories/:id').get(authenticateToken, getAllTripHistories);

// Get a single trip history by ID
router.route('/getTripHistoryById/:id').get(authenticateToken, getTripHistoryById);

// Update a trip history by ID
router.route('/update-trip/:id').put(authenticateToken, updateTripHistory);

// Delete a trip history by ID
router.route('/deleteTripHistory/:id').delete(authenticateToken, deleteTripHistory);

export default router;
