import { OrscfTokenService } from './../../services/OrscfTokenService';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Logger from 'jet-logger';
import { Request, Response } from 'express';

import { Controller, Get } from '@overnightjs/core';

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
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }

    @Get('getCapabilities')
    public async getCapabilities(req: Request, resp: Response) {
        try {
            const returnObject = {
                fault: '',
                return: ['SdrApiInfo, SubjectConsume, SubjectSubmission']
            };
            return resp.status(200).json(returnObject);
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }

    @Get('getPermittedAuthScopes')
    public async getPermittedAuthScopes(req: Request, resp: Response) {
        try {
            const authorizationHeader = req.headers.authorization;
            return resp
                .status(200)
                .json(OrscfTokenService.getPermittedAuthScopes(authorizationHeader));
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }
}
