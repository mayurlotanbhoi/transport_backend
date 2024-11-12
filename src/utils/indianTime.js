import moment from 'moment-timezone'; // Install with `npm install moment-timezone`

// Add payment_date to the update with Indian time
export const indianTime = moment().tz('Asia/Kolkata').format(); // Current Indian time in ISO format

