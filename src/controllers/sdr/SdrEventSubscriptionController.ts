// import Logger from 'jet-logger';
// import { Request, Response } from 'express';
// import { Controller, Get } from '@overnightjs/core';

// @Controller('sdrEventSubscription')
// export class SdrEventSubscriptionController {
//     @Get('subscribeForChangedSubjects')
//     public async subscribeForChangedSubjects(req: Request, resp: Response) {
//         try {
//             return resp.status(200).json({ fault: 'false', message: 'not yet implemented' });
//         } catch (error) {
//             Logger.Err(error, true);
//             return resp.status(500).json({ fault: 'true', return: error.message });
//         }
//     }
// }
