import { SubjectSearchResult } from './../../types/sdr/SubjectSearchResult';
import { SubjectSearchRequest } from './../../types/sdr/SubjectSearchRequest';
import { SubjectIdentitiesModel } from './../../models/SubjectIdentitiesModel';
import Logger from 'jet-logger';
import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';

@Controller('subjectConsume')
export class SubjectConsumeController {
    private subjectIdentityModel: SubjectIdentitiesModel = new SubjectIdentitiesModel();

    @Post('searchSubjects')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async searchSubjects(req: Request, resp: Response) {
        try {
            const searchRequest: SubjectSearchRequest = req.body;
            if (searchRequest === undefined || searchRequest === null) {
                return resp.status(500).json({ fault: 'true', return: 'invalid search request' });
            }

            const result: SubjectSearchResult[] = await this.subjectIdentityModel.searchParticipants(
                searchRequest
            );

            return resp.status(200).json({
                fault: 'false',
                result: result
            });
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }
}
