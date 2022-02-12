import { SubjectSearchResult } from './../../types/sdr/SubjectSearchResult';
import { SubjectSearchRequest } from './../../types/sdr/SubjectSearchRequest';
import { SubjectIdentitiesModel } from './../../models/SubjectIdentitiesModel';
import Logger from 'jet-logger';
import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { Subject } from '../../types/sdr/Subject';

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

    @Post('searchChangedSubjects')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async searchChangedSubjects(req: Request, resp: Response) {
        try {
            const searchRequest: SubjectSearchRequest = req.body;
            searchRequest.sortingField = 'last_action';
            searchRequest.sortDescending = true;

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

    @Post('getCustomFieldDescriptorsForSubject')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async getCustomFieldDescriptorsForSubject(req: Request, resp: Response) {
        try {
            return resp.status(200).json({
                fault: 'false',
                result: '???'
            });
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }

    @Post('checkSubjectExistence')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async checkSubjectExistence(req: Request, resp: Response) {
        try {
            const subjectUids: string[] = req.body.subjectUids;
            const unavailableSubjectUids: string[] = [];
            const availableSubjectUids: string[] = [];

            for (const subjectUid of subjectUids) {
                const subjectExists: boolean = await this.subjectIdentityModel.getSubjectIdentityExistenceBySubjectUid(
                    subjectUid
                );
                if (subjectExists) {
                    availableSubjectUids.push(subjectUid);
                } else {
                    unavailableSubjectUids.push(subjectUid);
                }
            }
            return resp.status(200).json({
                unavailableSubjectUids: unavailableSubjectUids,
                availableSubjectUids: availableSubjectUids,
                fault: 'false'
            });
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }

    @Post('getSubjectFields')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async getSubjectFields(req: Request, resp: Response) {
        try {
            const subjectUids: string[] = req.body.subjectUids;

            if (subjectUids === undefined || subjectUids === null || subjectUids.length === 0) {
                return resp.status(200).json({
                    unavailableSubjectUids: [],
                    result: [],
                    fault: 'false'
                });
            }
            const result: Subject[] = await this.subjectIdentityModel.getSubjects(subjectUids);

            const unavailableSubjectUids: string[] = subjectUids.filter(
                (s) => result.map((r) => r.subjectUid).indexOf(s) < 0
            );

            return resp.status(200).json({
                unavailableSubjectUids: unavailableSubjectUids,
                result: result,
                fault: 'false'
            });
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }
}
