import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

type CreateSignalRConnectionOptions = {
  getAccessToken?: () => string | null;
};

const signalRLogLevel = import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning;

export const createSignalRConnection = (
  hubUrl: string,
  options: CreateSignalRConnectionOptions = {},
) =>
  new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => options.getAccessToken?.() ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(signalRLogLevel)
    .build();

export const startSignalRConnection = async (connection: HubConnection) => {
  if (connection.state === HubConnectionState.Disconnected) {
    await connection.start();
  }
};

export const stopSignalRConnection = async (connection: HubConnection) => {
  if (connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }
};
