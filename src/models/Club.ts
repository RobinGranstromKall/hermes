export enum TeamTypes {
  Women,
  Men,
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


  let previousMatchesInMemory: Match[][] = [];
  let allSameTypeClubsHasPlayed = false;
  while (!allSameTypeClubsHasPlayed) {
    // TODO this seems to make duplicate rounds
    const shuffledClubs = clubs.sort(() => Math.random() - 0.5);
    const { round } = assignOrganisationTeamsToMatches(shuffledClubs, numberOfCourts, previousMatchesInMemory);

    if (round[0].length === 0) {
      console.log("ERROR no matches found");
      // break;
    }

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

function filterOutMatchesBasedOnTeamTypeAndOrganisation(
  attendee: MatchAttendee,
  matchAttendees: MatchAttendee[],
): MatchAttendee[] {
  // todo this doesnt take the current round in to consideration
  var updatedMatchAttendees = [];
  switch (attendee.teamType) {
    case TeamTypes.Men:
      updatedMatchAttendees = matchAttendees.filter(matchAttendee => {
        const isMensOrWomen = matchAttendee.teamType === TeamTypes.Men || matchAttendee.teamType === TeamTypes.Women;
        const isDifferentOrganisation = matchAttendee.organisation !== attendee.organisation;
        return isMensOrWomen || isDifferentOrganisation;
      })
      break;
    case TeamTypes.Women:
      updatedMatchAttendees = matchAttendees.filter(matchAttendee => {
        const isMensOrWomen = matchAttendee.teamType === TeamTypes.Men || matchAttendee.teamType === TeamTypes.Women;
        const isDifferentOrganisation = matchAttendee.organisation !== attendee.organisation;
        return isMensOrWomen || isDifferentOrganisation;
      })
      break;
    case TeamTypes.Mixed:
      updatedMatchAttendees = matchAttendees.filter(matchAttendee => {
        const isMixed = matchAttendee.teamType === TeamTypes.Mixed;
        const isDifferentOrganisation = matchAttendee.organisation !== attendee.organisation;
        return isMixed || isDifferentOrganisation;
      });
  }
  updatedMatchAttendees = updatedMatchAttendees.filter(matchAttendee => {
    return matchAttendee.organisation !== attendee.organisation || matchAttendee.teamType !== attendee.teamType;
  });
  return updatedMatchAttendees;
}

function findMaybeAttendee(previousMatches: Match[][], partialMatch: [(MatchAttendee | null), (MatchAttendee | null)]) {
  return (matchAttendee: MatchAttendee) => {
    const hasNotPlayedBefore = previousMatches.every(matches => {
      return matches.every(match => {
        return (match[0]?.organisation !== matchAttendee.organisation || match[1]?.organisation !== partialMatch[0]?.organisation) &&
          (match[0]?.organisation !== partialMatch[0]?.organisation || match[1]?.organisation !== matchAttendee.organisation);
      });
    });
    const isSameTeamType = matchAttendee.teamType === partialMatch[0]?.teamType;
    const isDifferentOrganisation = matchAttendee.organisation !== partialMatch[0]?.organisation;
    return isSameTeamType && isDifferentOrganisation && hasNotPlayedBefore;
  };
}

function assignOrganisationTeamsToMatches(
  clubs: Club[],
  numberOfCourts: number,
  previousMatches: Match[][]
) {
  let matchAttendees = clubs.reduce((acc, club) => {
    club.teamTypes.forEach(teamType => {
      acc.push({
        organisation: club.name,
        teamType
      });
    });
    return acc;
  }, [] as MatchAttendee[]);

  let rounds: Match[][] = [[]];

  let partialMatch: [MatchAttendee | null, MatchAttendee | null] = [null, null];

  while (matchAttendees.length !== 0) {
    let matchAttendee = matchAttendees[0];
    if (partialMatch[0] === null) {
      partialMatch[0] = matchAttendee;
      continue;
    }
    const maybeAttendeeIndex = matchAttendees.findIndex(findMaybeAttendee(previousMatches, partialMatch));

    const maybeAttendee = matchAttendees[maybeAttendeeIndex];
    if (!maybeAttendee) {
      console.log("ERROR no attendee found");
      matchAttendees.splice(0, 1); // used to wipe the list of attendees to get out of the loop, testing this to see if I can get better matches
      continue;
    }
    partialMatch[1] = maybeAttendee;

    matchAttendees = filterOutMatchesBasedOnTeamTypeAndOrganisation(matchAttendee, matchAttendees);
    matchAttendees = filterOutMatchesBasedOnTeamTypeAndOrganisation(maybeAttendee, matchAttendees);

    // add the match to the rounds array each round is an array of matches, only allow numberOfCourts matches per round
    if (rounds.length === 0) rounds.push([]);
    if (rounds[rounds.length - 1].length === numberOfCourts) rounds.push([]);
    rounds[rounds.length - 1].push(partialMatch as Match);
    partialMatch = [null, null];


    /*for (let j = 0; j < rounds.length; j++) {
      const matches = rounds[j];
      if (matches.length === numberOfCourts) {
        matches.push(partialMatch as Match);
        partialMatch = [null, null];
        break;
      } else {
        rounds.push([]);
      }
    }*/
  }

  console.log("test", {round: rounds, matchAttendees})
  return { round: rounds };
}