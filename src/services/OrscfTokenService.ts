import { OrscfAuthConfig } from './../config/OrscfAuthConfig';
import { SecurityService } from './SecurityService';
import { GetPermittedAuthScopesResponse } from './../types/sdr/GetPermittedAuthScopesResponse';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

interface JwtPayload {
    scp: string;
    iss: string;
}
export class OrscfTokenService {
    public static getPermittedAuthScopes(authHeader: string): GetPermittedAuthScopesResponse {
        if (authHeader === undefined || authHeader === null) {
            return {
                authState: 0,
                fault: null,
                return: []
            };
        }
        const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
            ? authHeader.substring(7)
            : authHeader;

        try {
            const decodedToken = jwt.verify(bearerToken, SecurityService.getJwtSecret(), {
                issuer: 'ECCT'
            });
            const jwtPayload: JwtPayload = <JwtPayload>decodedToken;
            return {
                authState: 1,
                fault: null,
                return: jwtPayload?.scp.split(' ')
            };
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return {
                    authState: -1,
                    fault: null,
                    return: []
                };
            } else {
                return {
                    authState: -2,
                    fault: null,
                    return: []
                };
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static authorizeOrscf(req, res, next, requiredExplicitPermissions: string[]) {
        const authHeader = req.headers.authorization;
        if (authHeader === undefined || authHeader === null) {
            return res.status(401).send("'Authorization'-Header was not provided");
        }
        const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
            ? authHeader.substring(7)
            : authHeader;

        try {
            const decodedToken = jwt.verify(bearerToken, SecurityService.getJwtSecret(), {
                issuer: 'ECCT'
            });
            const jwtPayload: JwtPayload = <JwtPayload>decodedToken;
            const allowedIssuers: string[] = OrscfAuthConfig.getAllowedIssuers();
            if (allowedIssuers.indexOf('*') < 0 && allowedIssuers.indexOf(jwtPayload.iss) < 0) {
                return res
                    .status(401)
                    .send(
                        "'Authorization'-Header contains an invalid bearer token (invalid issuer)!"
                    );
            }
            const allowedHosts: string[] = OrscfAuthConfig.getAllowedHosts();
            const host: string = req.hostname.toLowerCase();
            if (allowedHosts.indexOf('*') < 0 && allowedHosts.indexOf(host) < 0) {
                return res.status(401).send('access denied by firewall rules');
            }
            const grantedPermissions: string[] = jwtPayload.scp.split(';');
            if (requiredExplicitPermissions !== undefined && requiredExplicitPermissions !== null) {
                requiredExplicitPermissions.forEach((requiredPermission) => {
                    if (grantedPermissions.indexOf(requiredPermission) < 0) {
                        return res.status(401).send('permission denied for this operation');
                    }
                });
            }
            next();
        } catch (error) {
            return res
                .status(401)
                .send("'Authorization'-Header contains an invalid bearer token (decode failure)!");
        }

        //
        next();
    }
}
