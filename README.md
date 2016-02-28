# Munisense food order system
Internal application for https://munisense.com. It is an innovation project for ordering food for the lunch on friday using Meteor.

## How to install?
###### 1 Install meteor (https://www.meteor.com/)
###### 2 Grab the public key of login.munisense.net. (Sorry non-munisense developers. Its directly connected to munisense single sign (SSO) on at the moment)

⋅You can find it in the private Munisense API Git at https://gitlist.munisense.net/munisense/libs/backoffice-api.git/blob/master/api/Authentication.class.php#L33.
Save the contents starting -----BEGIN PUBLIC KEY----- and ending -----END PUBLIC KEY----- to /private/munisense_login_public_key.pem. (Dont forget to include line endings and -- key -- bits)

###### 3 Run Meteor. (meteor -p 80 for running port 80)
###### 4 (Optional) add local.office.munisense.net to your hosts.
The SSO works with cookies for the munisense.net domain. It will only work when you access it from a munisense.net domain. For development its best to add local.office.munisense.net pointing to 127.0.0.1 to your hosts file. You won't need a VPN connection to continue developing.
