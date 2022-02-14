import { OrscfTokenService } from './../../services/OrscfTokenService';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Logger from 'jet-logger';
import { Request, Response } from 'express';

import { Controller, Get } from '@overnightjs/core';

import {
    GetCapabilitiesResponse,
    GetApiVersionResponse,
    GetPermittedAuthScopesResponse
} from 'orscf-subjectdata-contract/dtos';

@Controller('sdrApiInfo')
export class SdrApiInfoController {
    @Get('getApiVersion')
    public async getApiVersion(req: Request, resp: Response) {
        try {
            const returnObject: GetApiVersionResponse = {
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
            const returnObject: GetCapabilitiesResponse = {
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
            const result: GetPermittedAuthScopesResponse = OrscfTokenService.getPermittedAuthScopes(
                authorizationHeader
            );
            return resp.status(200).json(result);
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }
}
