import Logger from 'jet-logger';
import { Request, Response } from 'express';
import jwt from 'express-jwt';

import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { AuthConfig } from '../config/AuthConfig';
import { AuthorizationController } from './AuthorizationController';

@Controller('sdrApiInfo')
export class SdrApiInfoController {

    @Get('getApiVersion')
    public async getApiVersion(req: Request, resp: Response) {
        try {
            const returnObject = {
                fault: '',
                return: '1.7.0'
            };
            return resp.status(200).json(returnObject);
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({fault: 'true', return: error.message});
        }
    }

    @Get('getCapabilities')
    public async getCapabilities(req: Request, resp: Response) {
        try {
            const returnObject = {
                fault: '',
                return: []
            };
            return resp.status(200).json(returnObject);
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({fault: 'true', return: error.message});
        }
    }
}
