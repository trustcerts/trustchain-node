# Provisioning
Grafana allows to be instalized with pre configured elements so it's very easy to configure a system [automatically](https://grafana.com/docs/grafana/latest/administration/provisioning/).

## Dashboard
Include the following file into the `provisioning/dashboards` folder to load the dashboards automatically:
`validator.yaml`
```
apiVersion: 1

providers:
  # <string> an unique provider name. Required
  - name: 'Validator1 - Services'
    # <int> Org id. Default to 1
    orgId: 1
    # <string> name of the dashboard folder.
    folder: ''
    # <string> folder UID. will be automatically generated if not specified
    folderUid: ''
    # <string> provider type. Default to 'file'
    type: file
    # <bool> disable dashboard deletion
    disableDeletion: false
    # <int> how often Grafana will scan for changed dashboards
    updateIntervalSeconds: 10
    # <bool> allow updating provisioned dashboards from the UI
    allowUiUpdates: true
    options:
      # <string, required> path to dashboard files on disk. Required when using the 'file' type
      path: /usr/share/conf/dashboards
      # <bool> use folder names from filesystem to create folders in Grafana
      foldersFromFilesStructure: true
```

This configuration will load all dashboard that are stored in the `/dashboards` folder in grafana-config volume.

## Datasources
The service dashboard has to be configured for each service individually in the `provisioning/datasources`. Therefore three datasources have to be added to the system for each node. We recommend to generate a yaml file for each node you want to monitor to increase the modular approach. Keep in mind that the credentials are saved in plain text so these files should be stored in a safe way! We strongly recommend to configure a read only user for grafana, otherwhise a hacker is able to swap keys for the authentication process. Instead of hardcoding them, you can use [environment variables](https://grafana.com/docs/grafana/latest/administration/provisioning/#using-environment-variables), pass them in the docker-compose yml of grafana and define them in the secure `.env` file.
```
# # config file version
apiVersion: 1

# # list of datasources that should be deleted from the database
deleteDatasources:
  - name: MySQL-Validator1
    orgId: 1
  - name: Loki-Validator1
    orgId: 1
  - name: Prometheus-Validator1
    orgId: 1

# # list of datasources to insert/update depending
# # on what's available in the database
datasources:
#   # <string, required> name of the datasource. Required
  - name: MySQL-Validator1
#   # <string, required> datasource type. Required
    type: mysql
#   # <string, required> access mode. direct or proxy. Required
    access: proxy
#   # <int> org id. will default to orgId 1 if not specified
    orgId: 1
#   # <string> url
    url: example.com:3306
#   # <string> database password, if used
    password: stringPassword
#   # <string> database user, if used
    user: readOnlyUser
#   # <string> database name, if used
    database: trustchain

  - name: Loki-Validator1
#   # <string, required> datasource type. Required
    type: loki
#   # <string, required> access mode. direct or proxy. Required
    access: proxy
#   # <int> org id. will default to orgId 1 if not specified
    orgId: 1
#   # <string> url
    url: https://loki.example.com

  - name: Prometheus-Validator1
#   # <string, required> datasource type. Required
    type: prometheus
#   # <string, required> access mode. direct or proxy. Required
    access: proxy
#   # <int> org id. will default to orgId 1 if not specified
    orgId: 1
#   # <string> url
    url: https://prometheus.example.com
```

## Notifiers
To be notified by the alerts of the service dashboard, you have to add to add one channel with the name `notification-channel-1` in the `/provisioning/notifiers/` folder:
```
notifiers:
  - name: notification-channel-1
    type: slack
    uid: notifier1
    # either
    org_id: 1    
    is_default: true
    send_reminder: true
    frequency: 1h
    disable_resolve_message: false
    # See `Supported Settings` section for settings supported for each
    # alert notification type.
    settings:
      recipient: '#monitor'
      uploadImage: true
      token: 'xoxb' # legacy setting since Grafana v7.2 (stored non-encrypted)
      url: https://hooks.slack.com/services/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 # legacy setting since Grafana v7.2 (stored non-encrypted)
    # Secure settings that will be encrypted in the database (supported since Grafana v7.2). See `Supported Settings` section for secure settings supported for each notifier.
    secure_settings:
      token: 'xoxb'
      url: https://slack.com

delete_notifiers:
  - name: notification-channel-1
    uid: notifier1
    org_id: 1
```

# Dashboards
The dashboards are defined in the `/dashboards` folder of the `grafana-config` volume. On the root level are dashboards stored that deal with all datasources in a dynamic way (e.g. a dasboard that shows all active connections from all known prometheus datasources). The folders include the dedicated dashboards for each node. They are bound to defined datasources so the alert rules can be triggered.

# TODO
find a userfriendly way to add a new node where the configured datasource yaml file will have a matched dashboard where the configured datasources are used.
Build a script that will match the defined datasource file with a dashboard to set the correct datasources.
