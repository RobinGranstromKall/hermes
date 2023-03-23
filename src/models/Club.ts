export enum TeamTypes {
  Womens,
  Mens,
  Mixed
}

type ClubProps = {
  name: string;
  teamTypes: TeamTypes[];
}

export class Club {
  name: string;
  teamTypes: TeamTypes[];

  constructor(props: ClubProps) {
    this.name = props.name;
    this.teamTypes = props.teamTypes;
  }
}

interface MatchAttendee {
  organisation: string;
  teamType: TeamTypes;
}

type Match = [MatchAttendee, MatchAttendee];

export function generateRoundRobin(clubs: Club[], numberOfCourts: number) {
  //let clubsInMemory = clubs;


  let previousMatchesInMemory: Match[][] = [[]];
  let allSameTypeClubsHasPlayed = false;
  while (!allSameTypeClubsHasPlayed) {
    // TODO this seems to make duplicate rounds
    const { round } = assignOrganisationTeamsToMatches(clubs, numberOfCourts, previousMatchesInMemory);

    previousMatchesInMemory = [...previousMatchesInMemory, ...round];

    allSameTypeClubsHasPlayed = clubs.every(club => {
      return club.teamTypes.every(teamType => {
        return previousMatchesInMemory.some(matches => {
          return matches.some(match => {
            return (match[0]?.organisation === club?.name || match[1]?.organisation === club?.name) && match[0]?.teamType === teamType && match[1]?.teamType === teamType;
          });
        });
      });
    })
    const prettyPrintPreviousMatches = previousMatchesInMemory.map(matches => {
      return matches.map(match => {
        return `${match[0]?.organisation} ${match[0]?.teamType} vs ${match[1]?.organisation} ${match[1]?.teamType}`
      });
    }).reduce((acc, matches) => {
      return acc.concat(matches);
    }, [] as string[]);
    console.log("allSameTypeClubsHasPlayed", { allSameTypeClubsHasPlayed, prettyPrintPreviousMatches, previousMatchesInMemory, simultaneousMatches: round })
  }
}
function assignOrganisationTeamsToMatches(
  clubs: Club[],
  numberOfCourts: number,
  previousMatches: Match[][]
) {
  const matchAttendees = clubs.reduce((acc, club) => {
    club.teamTypes.forEach(teamType => {
      acc.push({
        organisation: club.name,
        teamType
      });
    });
    return acc;
  }, [] as MatchAttendee[]);

  let round: Match[][] = new Array(numberOfCourts).fill([]);

  let partialMatch: [MatchAttendee | null, MatchAttendee | null] = [null, null];

  while (matchAttendees.length !== 0) {
    let matchAttendee = matchAttendees[0];
    if (partialMatch[0] === null) {
      // TODO Mixed can't play in the same round as Womens or Mens team from same organisation

      console.log("first match",JSON.stringify({
        matchAttendee: `${matchAttendee.organisation} ${matchAttendee.teamType}`,
        matchAttendeesLength: matchAttendees.length
      }, null, 2))
      partialMatch[0] = matchAttendee;
      continue;
    }
    const maybeAttendeeIndex = matchAttendees.findIndex((matchAttendee) => {
      const hasPlayedBefore = previousMatches.some(matches => {
        return matches.some(match => {
          return (match[0].organisation === matchAttendee.organisation && match[1].organisation === partialMatch[0]?.organisation) ||
            (match[0].organisation === partialMatch[0]?.organisation && match[1].organisation === matchAttendee.organisation);
        });
      });
      console.log(JSON.stringify({
        matchAttendee: `${matchAttendee.organisation} ${matchAttendee.teamType}`,
        toMatch: `${partialMatch[0]?.organisation} ${partialMatch[0]?.teamType}`,
        hasPlayedBefore
      }, null, 2))
      // TODO Mixed can't play in the same round as Womens or Mens team from same organisation
      return matchAttendee.organisation !== partialMatch[0]?.organisation && matchAttendee.teamType === partialMatch[0]?.teamType && !hasPlayedBefore;
    });

    const maybeAttendee = matchAttendees[maybeAttendeeIndex];
    console.log("second match",JSON.stringify({
      matchAttendee: `${maybeAttendee?.organisation} ${maybeAttendee?.teamType}`,
      toMatch: `${partialMatch[0]?.organisation} ${partialMatch[0]?.teamType}`,
      matchAttendees
    }, null, 2))
    if (!maybeAttendee) {
      console.log("ERROR no attendee found");
      matchAttendees.splice(0, matchAttendees.length); // HACK to break out of loop
    }
    partialMatch[1] = maybeAttendee;
    matchAttendees.splice(maybeAttendeeIndex, 1);
    matchAttendees.splice(0, 1);
    for (let j = 0; j < round.length; j++) {
      const matches = round[j];
      if (matches.length <= numberOfCourts) {
        matches.push(partialMatch as Match);
        partialMatch = [null, null];
        break;
      }
    }
  }

  console.log("test", {round, matchAttendees})
  return { round };
}