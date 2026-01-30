// events/user-created.event.ts

export class ContributorLoggedInEvent {
  constructor(
    public readonly user_id: string,
    public readonly device_token: string,
    public readonly device_type: 'android' | 'ios' | 'web' | undefined,
  ) {}
}
export class ContributorCreatedEvent {
  constructor(public readonly user_id) {}
}
