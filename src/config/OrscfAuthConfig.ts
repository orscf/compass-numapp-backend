import env from 'env-var';

export class OrscfAuthConfig {
    public static getAllowedIssuers(): string[] {
        return env.get('JWT_ALLOWED_ISSUERS').default('*').asArray(';');
    }
    public static getAllowedHosts(): string[] {
        return env.get('JWT_ALLOWED_HOSTS').default('*').asArray(';');
    }
}
