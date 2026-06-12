import { gql } from 'graphql-request';

export const GET_MY_AVAILABILITIES_QUERY = gql`
  query GetMyMentorAvailabilities {
    myMentorAvailabilities {
      id
      mentorId
      jobTitle
      company
      bio
      linkedinUrl
      yearsOfExperience
      skills
      isActive
      status
      note
      metadata {
        certificates {
          name
          issuedBy
          imageUrl
        }
        degrees {
          name
          university
          imageUrl
        }
      }
      user {
        id
        name
        email
        avatarUrl
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_AVAILABILITIES_QUERY = gql`
  query GetAllMentorAvailabilities($page: Int, $limit: Int, $search: String, $status: MentorAvailabilityStatus) {
    mentorAvailabilities(page: $page, limit: $limit, search: $search, status: $status) {
      items {
        id
        mentorId
        jobTitle
        company
        bio
        linkedinUrl
        yearsOfExperience
        skills
        isActive
        status
        note
        metadata {
          certificates {
            name
            issuedBy
            imageUrl
          }
          degrees {
            name
            university
            imageUrl
          }
        }
        user {
          id
          name
          email
          avatarUrl
        }
        createdAt
        updatedAt
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const GET_MENTOR_AVAILABILITY_QUERY = gql`
  query GetMentorAvailability($id: ID!) {
    mentorAvailability(id: $id) {
      id
      mentorId
      jobTitle
      company
      bio
      linkedinUrl
      yearsOfExperience
      skills
      isActive
      status
      note
      metadata {
        certificates {
          name
          issuedBy
          imageUrl
        }
        degrees {
          name
          university
          imageUrl
        }
      }
      user {
        id
        name
        email
        avatarUrl
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_MENTOR_AVAILABILITY_MUTATION = gql`
  mutation CreateMentorAvailability($input: CreateMentorAvailabilityGqlInput!) {
    createMentorAvailability(input: $input) {
      message
      data {
        id
        mentorId
        jobTitle
        company
        status
        createdAt
      }
    }
  }
`;
