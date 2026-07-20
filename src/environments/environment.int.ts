export const environment = {
    production: false,
    apiURL: 'https://int.minds-rgpd.minds.k8s/apims',
    keycloak: {
        url: 'https://sso.minds.k8s/auth',
        realm: 'minds-rgpd',
        clientId: 'minds-saas-rgpd',
        redirectUri: window.location.origin
    }
};
