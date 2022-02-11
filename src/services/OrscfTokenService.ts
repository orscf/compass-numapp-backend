import { SecurityService } from './SecurityService';
import { GetPermittedAuthScopesResponse } from './../types/sdr/GetPermittedAuthScopesResponse';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    scp: string;
}
export class OrscfTokenService {
    public static getPermittedAuthScopes(token: string): GetPermittedAuthScopesResponse {
        if (token === undefined || token === null) {
            return {
                authState: 1,
                fault: 'false',
                return: []
            };
        }
        const decodedToken = jwt.verify(token, SecurityService.getJwtSecret(), {
            issuer: 'ECCT'
        });
        const jwtPayload: JwtPayload = <JwtPayload>decodedToken;

        return {
            authState: 1,
            fault: 'false',
            return: jwtPayload?.scp.split(' ')
        };
    }
}
