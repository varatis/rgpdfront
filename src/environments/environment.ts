export const environment = {
  production: false,
  apiURL: 'http://localhost:8080/',
  keycloak: {
    url: 'https://sso.minds.k8s/auth',
    realm: 'creative',
    clientId: 'minds-saas-rgpd',
    redirectUri: window.location.origin
  }
};
