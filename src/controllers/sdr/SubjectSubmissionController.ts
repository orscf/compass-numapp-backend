import { SecurityService } from './../../services/SecurityService';
import { SdrMappingHelper } from './../../services/SdrMappingHelper';
import { ParticipantEntry } from './../../types/ParticipantEntry';
import { SubjectIdentitiesModel } from './../../models/SubjectIdentitiesModel';
import { Subject } from './../../types/sdr/Subject';
import Logger from 'jet-logger';
import { Request, Response } from 'express';
import { Controller, Post, Middleware } from '@overnightjs/core';
import jwt from 'express-jwt';
import { AuthorizationController } from '../AuthorizationController';

@Controller('subjectSubmission')
export class SubjectSubmissionController {
    private subjectIdentityModel: SubjectIdentitiesModel = new SubjectIdentitiesModel();

    @Post('importSubjects')
    @Middleware(
        jwt({
            secret: SecurityService.secretCallback,
            algorithms: ['HS256'],
            requestProperty: 'payload',
            isRevoked: AuthorizationController.checkOrscfAuthentication
        })
    )
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async importSubjects(req: Request, resp: Response) {
        try {
            const subjects: Subject[] = req.body.subjects;
            if (subjects === undefined || subjects === null) {
                return resp.status(500).json({ fault: 'true', return: 'no subjects on request' });
            }

            const createdSubjectUids: string[] = [];
            const updatedSubjectUids: string[] = [];

            for (const subject of subjects) {
                const participant: ParticipantEntry = SdrMappingHelper.mapSubjectToParticipantEntry(
                    subject
                );
                const subjectIdentityExistence: boolean = await this.subjectIdentityModel.getSubjectIdentityExistence(
                    participant.subject_id
                );
                if (subjectIdentityExistence) {
                    await this.subjectIdentityModel.updateStudyParticipant(participant);
                    updatedSubjectUids.push(participant.subject_uid);
                } else {
                    await this.subjectIdentityModel.createStudyParticipant(participant);
                    createdSubjectUids.push(participant.subject_uid);
                }
            }

            return resp.status(200).json({
                fault: 'false',
                createdSubjectUids: createdSubjectUids,
                updatedSubjectUids: updatedSubjectUids
            });
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }

    @Post('archiveSubjects')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async archiveSubjects(req: Request, resp: Response) {
        try {
            const subjectUids: string[] = req.body.subjectUids;
            if (subjectUids === undefined || subjectUids === null) {
                return resp.status(500).json({ fault: 'true', return: 'no subjects on request' });
            }

            const archivedSubjectUids: string[] = [];

            for (const subjectUid of subjectUids) {
                const subjectIdentityExistence: boolean = await this.subjectIdentityModel.getSubjectIdentityExistence(
                    subjectUid
                );
                if (!subjectIdentityExistence) {
                    return resp.status(404).json({ fault: 'true', return: 'subject not found' });
                }
            }

            for (const subjectUid of subjectUids) {
                await this.subjectIdentityModel.deleteStudyParticipant(subjectUid);
                archivedSubjectUids.push(subjectUid);
            }

            return resp.status(200).json({
                fault: 'false',
                archivedSubjectUids: archivedSubjectUids
            });
        } catch (error) {
            Logger.Err(error, true);
            return resp.status(500).json({ fault: 'true', return: error.message });
        }
    }
}
