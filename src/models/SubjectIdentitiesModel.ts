import { Subject } from './../types/sdr/Subject';
import { SdrMappingHelper } from './../services/SdrMappingHelper';
import { ParticipantEntry } from './../types/ParticipantEntry';
/*
 * Copyright (c) 2021, IBM Deutschland GmbH
 */
import { Pool } from 'pg';
import Logger from 'jet-logger';
import DB from '../server/DB';
import { SubjectSearchRequest } from '../types/sdr/SubjectSearchRequest';
import { SubjectSearchResult } from '../types/sdr/SubjectSearchResult';

export class SubjectIdentitiesModel {
    /**
     * Verify if participant exists in database.
     * @param subjectID The participant id
     */
    public async getSubjectIdentityExistence(subjectID: string): Promise<boolean> {
        try {
            const pool: Pool = DB.getPool();
            const res = await pool.query('select * from studyparticipant where subject_id = $1', [
                subjectID
            ]);

            if (res.rows.length !== 1) {
                return false;
            }
            return true;
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
    }

    public async getSubjectIdentityExistenceBySubjectUid(subjectUid: string): Promise<boolean> {
        try {
            const pool: Pool = DB.getPool();
            const res = await pool.query('select * from studyparticipant where subject_uid = $1', [
                subjectUid
            ]);

            if (res.rows.length !== 1) {
                return false;
            }
            return true;
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
    }

    /**
     * Add a new participant
     * @param subjectID The participant id
     */
    public async addNewSubjectIdentity(subjectID: string): Promise<void> {
        try {
            const pool: Pool = DB.getPool();
            await pool.query('INSERT INTO studyparticipant(subject_id) VALUES ($1);', [subjectID]);
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
        return;
    }

    public async createStudyParticipant(studyParticipant: ParticipantEntry): Promise<void> {
        try {
            const pool: Pool = DB.getPool();
            await pool.query(
                'INSERT INTO studyparticipant(\
                    subject_id,\
                    current_questionnaire_id,\
                    start_date,\
                    due_date,\
                    current_instance_id,\
                    current_interval,\
                    additional_iterations_left,\
                    status,\
                    general_study_end_date,\
                    personal_study_end_date,\
                    registration_token,\
                    subject_uid,\
                    study_uid, \
                    actual_site_uid,\
                    enrolling_site_uid,\
                    actual_site_defined_patient_identifier\
                 ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)',
                [
                    studyParticipant.subject_id,
                    studyParticipant.current_questionnaire_id,
                    studyParticipant.start_date,
                    studyParticipant.due_date,
                    studyParticipant.current_instance_id,
                    studyParticipant.current_interval,
                    studyParticipant.additional_iterations_left,
                    studyParticipant.status,
                    studyParticipant.general_study_end_date,
                    studyParticipant.personal_study_end_date,
                    null,
                    studyParticipant.subject_uid,
                    studyParticipant.study_uid,
                    studyParticipant.actual_site_uid,
                    studyParticipant.enrolling_site_uid,
                    studyParticipant.actual_site_defined_patient_identifier
                ]
            );
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
    }

    public async updateStudyParticipant(studyParticipant: ParticipantEntry): Promise<void> {
        try {
            const pool: Pool = DB.getPool();
            await pool.query(
                'UPDATE studyparticipant \
                    set subject_id = $1,\
                    current_questionnaire_id = $2,\
                    start_date = $3,\
                    due_date = $4,\
                    current_instance_id = $5,\
                    current_interval = $6,\
                    additional_iterations_left = $7,\
                    status = $8,\
                    general_study_end_date = $9,\
                    personal_study_end_date = $10,\
                    registration_token = $11,\
                    subject_uid = $12,\
                    study_uid = $13, \
                    actual_site_uid = $14,\
                    enrolling_site_uid = $15,\
                    actual_site_defined_patient_identifier = $16 where subject_uid = $12',
                [
                    studyParticipant.subject_id,
                    studyParticipant.current_questionnaire_id,
                    studyParticipant.start_date,
                    studyParticipant.due_date,
                    studyParticipant.current_instance_id,
                    studyParticipant.current_interval,
                    studyParticipant.additional_iterations_left,
                    studyParticipant.status,
                    studyParticipant.general_study_end_date,
                    studyParticipant.personal_study_end_date,
                    null,
                    studyParticipant.subject_uid,
                    studyParticipant.study_uid,
                    studyParticipant.actual_site_uid,
                    studyParticipant.enrolling_site_uid,
                    studyParticipant.actual_site_defined_patient_identifier
                ]
            );
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
    }

    public async deleteStudyParticipant(subjectId: string): Promise<void> {
        try {
            const pool: Pool = DB.getPool();
            await pool.query('DELETE FROM studyparticipant where subject_uid = $1', [subjectId]);
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
    }

    public async searchParticipants(
        searchRequest: SubjectSearchRequest
    ): Promise<SubjectSearchResult[]> {
        try {
            const pool: Pool = DB.getPool();

            const minPeriodStartWhereClause =
                searchRequest.filter.minPeriodStart === undefined
                    ? ''
                    : ` AND '${searchRequest.filter.minPeriodStart}' <= start_date`;

            const maxPeriodStartWhereClause =
                searchRequest.filter.maxPeriodStart === undefined
                    ? ''
                    : ` AND '${searchRequest.filter.maxPeriodStart}' >= start_date`;

            const minPeriodEndWhereClause =
                searchRequest.filter.minPeriodEnd === undefined
                    ? ''
                    : ` AND '${searchRequest.filter.minPeriodEnd}' <= personal_study_end_date`;

            const maxPeriodEndWhereClause =
                searchRequest.filter.maxPeriodEnd === undefined
                    ? ''
                    : ` AND '${searchRequest.filter.maxPeriodEnd}' >= personal_study_end_date`;

            const changeDateWhereClause =
                searchRequest.minTimestampUtc === undefined
                    ? ''
                    : ` AND '${searchRequest.minTimestampUtc}' <= last_action`;

            const timeStampWhereClause =
                minPeriodStartWhereClause +
                maxPeriodStartWhereClause +
                minPeriodEndWhereClause +
                maxPeriodEndWhereClause +
                changeDateWhereClause;

            const searchSql = `SELECT \
                subject_uid AS "subjectUid", \
                subject_id AS "subjectIdentifier", \
                study_uid AS "studyUid", \
                actual_site_uid AS "actualSiteUid", \
                0 AS "isArchived", \
                0 AS modiciationTimestampUtc \
                FROM studyparticipant where \
                    1 = 1 \
                    And (\
                        '${searchRequest.filter.studyUid}' = 'undefined' or \
                        ('${searchRequest.filter.studyUid}' = 'null' and study_uid is null) or \
                        '${searchRequest.filter.studyUid}' = study_uid\
                    ) \
                    And (\
                        '${searchRequest.filter.siteUid}' = 'undefined' or \
                        ('${
                            searchRequest.filter.siteUid
                        }' = 'null' and actual_site_uid is null) or \
                        '${searchRequest.filter.siteUid}' = actual_site_uid\
                    ) \
                    And (\
                        '${searchRequest.filter.subjectIdentifier}' = 'undefined' or \
                        ('${
                            searchRequest.filter.subjectIdentifier
                        }' = 'null' and subject_id is null) or \
                        '${searchRequest.filter.subjectIdentifier}' = subject_id\
                    ) \
                    And (\
                        '${searchRequest.filter.status}' = 'undefined' or \
                        '${searchRequest.filter.status}' = status\
                    ) \
                    And (\
                        '${
                            searchRequest.filter.actualSiteDefinedPatientIdentifier
                        }' = 'undefined' or \
                        ('${
                            searchRequest.filter.actualSiteDefinedPatientIdentifier
                        }' = 'null' and actual_site_defined_patient_identifier is null) or \
                        '${
                            searchRequest.filter.actualSiteDefinedPatientIdentifier
                        }' = actual_site_defined_patient_identifier\
                    ) ${timeStampWhereClause}
                ORDER BY ${SdrMappingHelper.mapSdrSubjectPropnameToParticipantPropName(
                    searchRequest.sortingField
                )} ${searchRequest.sortDescending ? ' DESC' : ''}\
                LIMIT ${searchRequest.limitResults}`;

            const searchQuery = await pool.query(searchSql);
            return searchQuery.rows;
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
    }

    public async getSubjects(subjectUids: string[]): Promise<Subject[]> {
        try {
            const pool: Pool = DB.getPool();
            let subjectUidsIn = '';
            // TODO: Performance des womöglich großen where in ???
            for (let i = 0; i < subjectUids.length; i++) {
                const subjectUid: string = subjectUids[i];
                subjectUidsIn += `'${subjectUid}'`;
                if (i < subjectUids.length - 1) {
                    subjectUidsIn += ',';
                }
            }

            const getSubjetsQuery = await pool.query(
                `SELECT \
                    subject_uid AS "subjectUid", \
                    subject_id AS "subjectIdentifier", \
                    study_uid AS "studyUid", \
                    actual_site_uid AS "actualSiteUid", \
                    'false' AS "isArchived", \
                    last_action AS "modificationTimestampUtc", \
                    enrolling_site_uid AS "enrollingSiteUid", \
                    status AS "status", \
                    '' AS "statusNote", \
                    start_date AS "periodStart", \
                    personal_study_end_date AS "periodEnd", \
                    '' AS "assignedArm", \
                    '' AS "actualArm", \
                    '' AS "substudyNames", \
                    actual_site_defined_patient_identifier AS "actualSiteDefinedPatientIdentifier", \
                    '' AS "customFields" \
                FROM studyparticipant where subject_uid in (${subjectUidsIn}) \
                `
            );
            return getSubjetsQuery.rows;
        } catch (err) {
            Logger.Err(err);
            throw err;
        }
    }
}
