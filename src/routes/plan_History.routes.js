// routes/tripHistoryRoutes.js
import express from 'express';
import { Router } from "express";

import { authenticateToken } from '../controllers/auth.controller.js';
import { getYourPlance } from '../controllers/plans.controler.js';


const router = Router();


// Create a new trip history
// router.route('/create-trip').post(authenticateToken, createTripHistory);

// Get all trip histories
router.route('/getYourPlance-history').get(authenticateToken, getYourPlance);

// Get a single trip history by ID
// router.route('/getTripHistoryById/:id').get(authenticateToken, getTripHistoryById);

// Update a trip history by ID
// router.route('/update-trip/:id').put(authenticateToken, updateTripHistory);

// Delete a trip history by ID
// router.route('/deleteTripHistory/:id').delete(authenticateToken, deleteTripHistory);

export default router;
